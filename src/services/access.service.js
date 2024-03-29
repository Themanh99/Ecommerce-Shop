"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { findByEmail } = require("./shop.service");
const { StatusCodes } = require("../utils/httpStatusCode");
const {
  BadRequestError,
  ConflictRequestError,
} = require("../core/error.response");

const RoleShop = {
  SHOP: "SHOP",
  WRITE: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};
class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // check if the user is already registed
      const holderShop = await shopModel.findOne({ email }).lean();

      if (holderShop) {
        throw new BadRequestError("Error::Shop is already registed!");
      }
      const passwordHash = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });
      if (newShop) {
        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
        });
        if (!keyStore) {
          throw new ConflictRequestError("Error::Key store is not created!");
        }
        const tokens = await createTokenPair(
          {
            userId: newShop._id,
            email,
          },
          publicKey,
          privateKey
        );
        console.log("Created Token Success::", tokens);

        return {
          message: "Created Done!",
          metadata: {
            shop: getInfoData({
              fields: ["_id", "name", "email"],
              object: newShop,
            }),
            tokens,
          },
        };
      }
    } catch (error) {
      return {
        code: error.status,
        message: error.message,
        status: error.status,
      };
    }
  };

  static logIn = async ({ email, password, refreshToken = null }) => {
    // Check email
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new ConflictRequestError("Error:: Email was not registered!");
    }
    // Check password
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) {
      throw new AuthFailureError("Error:: Password is not correct!");
    }
    // Create key private and public
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    if (!tokens) {
      throw new ConflictRequestError("Error::Tokens is not created!");
    }
    await KeyTokenService.createKeyToken({
      userId,
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };
}

module.exports = AccessService;
