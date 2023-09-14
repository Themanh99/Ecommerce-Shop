"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
} = require("../core/error.response");

const { CREATED } = require("../core/success.response");
const { findByEmail } = require("./shop.service");
const RoleShop = {
  SHOP: "SHOP",
  WRITE: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};
class AccessService {
  static logIn = async ({ email, password, refreshToken = null }) => {
    // Check email
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop is not registed");
    // Check password
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error!");
    // Create key private and public
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    try {
      // check if the user is already registed
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        throw new ConflictRequestError("Error: Shop is already registed");
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
          throw new ConflictRequestError("Error: keyStore error");
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
          message: "Token created",
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
}

module.exports = AccessService;
