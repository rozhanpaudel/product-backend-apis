
require('dotenv').config()
module.exports = {
  accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.APP_AWS_SECRET_KEY,
  region: process.env.APP_AWS_REGION,
  bucketName: process.env.APP_AWS_S3_BUCKET_NAME,
  remoteS3Url: process.env.APP_AWS_S3_REMOTE_URL || 'https://roshanpaudel.s3.ap-southeast-2.amazonaws.com/'
}