/**
 * Using Factory Pattern
 */
const { product, clothes, electronic } = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");

class ProductFactory {
  static async createProduct({ type, payload }) {
    switch (type) {
      case "clothes":
        return new Clothing(payload);
      case "electronics":
        return new Electronics(payload);
      default:
        return new BadRequestError(`Invalid product type ${type}`);
    }
  }
}

/**
 * TODO:Define product, clothes and electronic classes
 */
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  async createProduct() {
    return await product.create(this);
  }
}

class Clothing extends Product {
  async createProduct() {
    const newClothes = await clothes.create(this.product_attributes);
    if (!newClothes) {
      throw new BadRequestError("Create new clothes error!");
    }

    const newProduct = await super.createProduct();
    if (!newProduct) {
      throw new BadRequestError("Create new clothes error!");
    }

    return newProduct;
  }
}

class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronic.create(this.product_attributes);
    if (!newElectronic) {
      throw new BadRequestError("Create new electronic error!");
    }

    const newProduct = await super.createProduct();
    if (!newProduct) {
      throw new BadRequestError("Create new clothes error!");
    }

    return newProduct;
  }
}
