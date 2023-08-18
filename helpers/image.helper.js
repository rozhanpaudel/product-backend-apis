const sharp = require("sharp")

const generateThumbnailFromImage = async (buffer, width, height, fit = true,) => {
  try {
    let data = await sharp(buffer, { limitInputPixels: false }).resize({ width, height, fit: fit ? sharp.fit.inside : null }).jpeg({ quality: 90, chromaSubsampling: '4:4:4' }).toBuffer()
    return data
  } catch (error) {
    console.log(error)
    throw error
  }
}

module.exports = { generateThumbnailFromImage }