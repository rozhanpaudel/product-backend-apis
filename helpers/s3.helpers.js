const AWS = require('aws-sdk')
const config = require('../config/config')


const s3 = new AWS.S3({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: config.region
})

/**
 * @param {Buffer} bufferBody  => File Buffer
 * @param {String} fileMime  => mime type of file
 * @param {String} fileName => File Name
 * @param {String} bucketName => Bucket Name to store file in!
 * @param {String} fileDir => File Directory to store in S3 (optional)
 * @returns
 */
const uploadFile = async (bufferBody, fileName, fileMime, fileDir, bucketName = config.bucketName) => {
  return new Promise((resolve, reject) => {
    const Key = `${fileDir ? `${fileDir}/` : ''
      }${fileName}`
    s3.upload(
      {
        Bucket: bucketName,
        Body: bufferBody,
        Key,
        ContentType: fileMime
      },
      (err, data) => (err == null ? resolve(data) : reject(err))
    )
  })
}

const deleteFile = async (fileKey, bucketName = config.bucketName) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject({
      Bucket: bucketName,
      Key: fileKey
    }, (err, data) => {
      if (err) {
        reject(err)
      }
      console.log(`File deleted successfully: ${fileKey}`)
      resolve(data)
    })
  })
}

const getSignedUrl = (key, removeSigning = false, expiry = 60, bucketName = config.bucketName) => {
  const params = { Bucket: bucketName, Key: key, Expires: expiry }
  const url = s3.getSignedUrl('getObject', params)
  return removeSigning ? url.split('?AWSAccessKeyId')[0] : url
}

const getSignedUrlFromExistingUrl = (url, removeSigning = false,
  expiry = 60 * 60 * 24,
  bucketName = config.bucketName) => {
  const s3Url = new URL(url)
  return getSignedUrl(decodeURI(s3Url.pathname.substring(1)), removeSigning, expiry, bucketName)
}


module.exports = { uploadFile, getSignedUrl, deleteFile, getSignedUrlFromExistingUrl }