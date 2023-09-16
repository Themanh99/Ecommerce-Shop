"use strict";
const { SuccessResponse, CREATED } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.logIn(req.body),
    }).send(res);
  };

  signup = async (req, res, next) => {
    new CREATED({
      message: "Signup",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout succes!",
      metadata: await AccessService.logOut(req.keyStore),
    }).send(res);
  };

  handlerRefreshToken = async (req, res, next) => {
    console.log(req.refreshToken);
    new SuccessResponse({
      message: "Refresh Token Succes!",
      metadata: await AccessService.handlerRefreshToken({
        tokenRefresh: req.refreshToken,
        keyStore: req.keyStore,
        user: req.user,
      }),
    }).send(res);
  };
}

module.exports = new AccessController();
