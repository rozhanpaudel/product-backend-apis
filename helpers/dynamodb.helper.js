
const AWS = require('aws-sdk');
const config = require('../config/config');

// Configure AWS SDK with your credentials and region
AWS.config.update({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: config.region
});
// Create a DynamoDB document client
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Method to create a new row in a DynamoDB table
async function createRow(tableName, newItem) {
  const params = {
    TableName: tableName,
    Item: newItem
  };

  try {
    await dynamodb.put(params).promise();
    console.log('Item created successfully:', newItem);
    return newItem
  } catch (error) {
    console.error('Error creating item:', error);
  }
}


async function getRows(params) {
  const result = await dynamodb.scan(params).promise();
  const nextKey = result.LastEvaluatedKey;
  return { items: result.Items, nextKey };
}


async function deleteRow(params) {
  const deletionResp = await dynamodb.delete(params).promise();
  console.log('Item deleted successfully:');
  return deletionResp
}

async function updateProductThumbnailUrl(productId, newThumbnailUrl) {
  const params = {
    TableName: 'products',
    Key: {
      id: productId
    },
    UpdateExpression: 'SET thumbnailUrl = :newThumbnailUrl',
    ExpressionAttributeValues: {
      ':newThumbnailUrl': newThumbnailUrl
    },
    ReturnValues: 'ALL_NEW'
  };

  try {
    const result = await dynamodb.update(params).promise();
    console.log('Product thumbnailUrl updated successfully:', productId);
    return result.Attributes;
  } catch (error) {
    console.error('Error updating product thumbnailUrl:', error);
    return null;
  }
}
module.exports = { createRow, getRows, deleteRow, updateProductThumbnailUrl }

