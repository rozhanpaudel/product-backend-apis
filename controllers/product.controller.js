const express = require('express');
const multer = require('multer');
const config = require('../config/config');
const { updateProductThumbnailUrl } = require('../helpers/dynamodb.helper');
const { generateThumbnailFromImage } = require('../helpers/image.helper');
const { uploadFile, deleteFile, getSignedUrlFromExistingUrl } = require('../helpers/s3.helpers');
const ProductModel = require('../models/product.model');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // limit file size to 15MB
  },
})

async function cleanS3Storage(product) {
  let promBag = []
  if (product.thumbnailUrl) {
    const thumbnailKey = product.thumbnailUrl.split(config.remoteS3Url)[1]
    promBag.push(deleteFile(decodeURI(thumbnailKey)))
  }
  if (product.image_url) {
    const imageKey = product.image_url.split(config.remoteS3Url)[1]
    promBag.push(deleteFile(decodeURI(imageKey)))
  }
  await Promise.all(promBag)
  console.log('Storage Cleanup Completed')
}


const generateThumbnailAndUploadToS3 = async (product, buffer) => {
  const thumbnailBuffer = await generateThumbnailFromImage(buffer, 250, 250)
  const thumbnailFilename = `thumb-${Date.now()}.jpeg`
  const response = await uploadFile(thumbnailBuffer, thumbnailFilename, 'image/jpeg', 'product-images/thumbs')
  await updateProductThumbnailUrl(product.id, response.Location)
}

router.get('/', async (req, res) => {
  const query = new ProductModel()
  const products = await query.getAllProducts(100, null)
  let parsedProducts = products.items
  for(const pr of parsedProducts){
    pr.thumbnailUrl = pr.thumbnailUrl ? getSignedUrlFromExistingUrl(pr.thumbnailUrl) : null
    pr.image_url = pr.image_url ? getSignedUrlFromExistingUrl(pr.image_url) : null
  }
  res.json({
    success: true,
    message: "Successfully fetched all the products",
    data: parsedProducts,
    nextKey: products.nextKey
  })
})

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(422).json({
      success: false,
      message: 'File is required to proceed the request'
    })
  }
  const filename = `${Date.now()}-${req.file.originalname}}`
  console.log('Uploading the file ', JSON.stringify(req.file))
  const response = await uploadFile(req.file.buffer, filename, req.file.mimetype, 'product-images')
  console.log('Uploaded file to S3 Bucket with response', JSON.stringify(response))
  const payload = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    image_url: response?.Location
  }
  const product = new ProductModel(payload)
  const row = await product.save()
  console.log('Started the async process of generating the thumbnail for product')
  generateThumbnailAndUploadToS3(row, req.file.buffer)
    .then((done) => {
      console.log('Response from thumbnail generator', done)
      console.log('Thumbnail successfully generated for the product with id ', row.id)
    })
    .catch((err) => console.log(err))
  res.json({
    success: true,
    message: "Successfully created a product",
    data: row
  })
})


router.delete('/:id', async (req, res) => {
  const id = req.params.id
  const productModel = new ProductModel()
  const result = await productModel.delete(id)
  if (result.Attributes) {
    cleanS3Storage(result.Attributes)
      .then((res) => {
        console.log(res)
        console.log(`Disk cleanup complete`)
      })
      .catch((err) => console.log(err))
  }
  return res.status(200).json({
    success: true, message: "Product deleted successfully", data: result.attributes
  })
})

module.exports = router