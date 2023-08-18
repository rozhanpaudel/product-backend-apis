const { createRow, getRows, deleteRow } = require("../helpers/dynamodb.helper");

class ProductModel {
  constructor({ name, description, price, image_url, thumbnailUrl = null } = {}) {
    this.tableName = 'products'
    this.product = {
      id: Date.now().toString(), name, description, price, image_url, thumbnailUrl
    }
  }
  async save() {
    const response = await createRow(this.tableName, this.product)
    return response
  }

  async getAllProducts(size, startKey) {
    const params = {
      TableName: this.tableName,
      Limit: size,
      ExclusiveStartKey: startKey
    };

    try {
      const result = await getRows(params)
      return result
    } catch (error) {
      console.error('Error retrieving items:', error);
      return { items: [], nextKey: null };
    }
  }

  async delete(primaryKeyValue) {
    const params = {
      TableName: this.tableName,
      Key: {
        'id': primaryKeyValue
      },
      ReturnValues: 'ALL_OLD'
    };
    try {
      const response = await deleteRow(params)
      return response
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

}

module.exports = ProductModel