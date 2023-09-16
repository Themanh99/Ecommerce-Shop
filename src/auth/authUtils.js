"use strict";

const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { findByUserId } = require("../services/keyToken.service");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { getUrlFromPath } = require("../utils");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "x-auth-token",
  REFRESH_TOKEN: "x-refresh-token",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify::`, err);
      } else {
        console.log(`decode verify::`, decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  /**
   * TODO: Check user in request ,  if user is not found throw Authenfail
   */
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId)
    throw new AuthFailureError("Invalid request! - UserId not found");
  /**
   * TODO: Get key from DB , if it is not found throw NotFound
   */
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Key not found!");

  /**
   * TODO: Verify accesToken
   */
  const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
  const path = getUrlFromPath(req.originalUrl);

  if (refreshToken && path === "rftoken") {
    try {
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId != decodeUser.userId)
        throw new AuthFailureError("Invalid request! - Invalid userId!");

      req.keyStore = keyStore;
      req.refreshToken = refreshToken;
      req.user = decodeUser;
      return next();
    } catch (error) {
      throw error;
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) {
    throw new AuthFailureError("Invalid request! - AccesToken not found!");
  }
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId != decodeUser.userId)
      throw new AuthFailureError("Invalid request! - Invalid userId!");

    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyToken = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyToken,
};
