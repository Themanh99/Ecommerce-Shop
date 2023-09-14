"use strict";
const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  login = async (req, res, next) => {
    new SuccessResponse({
      message: "Login done",
      metadata: await AccessService.logIn(req.body),
    }).send(res);
  };
  signup = async (req, res, next) => {
    new CREATED({
      message: "registed OK!",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };
}

module.exports = new AccessController();
