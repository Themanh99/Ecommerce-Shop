"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyToken } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { findByEmail } = require("./shop.service");
const { StatusCodes } = require("../utils/httpStatusCode");
const {
  ForBiddenError,
  ConflictRequestError,
  AuthFailureError,
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
        throw new ForBiddenError("Error::Shop is already registed!");
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

  static logOut = async (keyStore) => {
    const deleteKey = await KeyTokenService.removeKeyById(keyStore._id);
    return deleteKey;
  };

  static handlerRefreshToken = async ({ user, keyStore, tokenRefresh }) => {
    /**
     * TODO: Check refresh token in list refresh token used
     * IF TRUE => delete all refresh token of this user
     */
    const { userId, email } = user;
    if (keyStore.refreshTokensUsed.includes(tokenRefresh)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForBiddenError("Warning:: Token is expired! Please relogin");
    }
    if (tokenRefresh !== keyStore.refreshToken)
      throw new AuthFailureError(
        "Error:: Shop is not registed with refresh token!"
      );

    const foundShop = await KeyTokenService.findByUserId(userId);
    if (!foundShop)
      throw new AuthFailureError("Error:: Shop is not registed with userid!");
    /**
     * TODO: Update refresh token list used and update refresh token new
     */
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );
    await keyStore.update({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: tokenRefresh,
      },
    });

    return {
      user,
      tokens,
    };
  };
}

module.exports = AccessService;
