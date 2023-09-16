"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const router = express.Router();
const { asyncHandle } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");

//sign up
router.post("/shop/signup", asyncHandle(accessController.signup));
router.post("/shop/login", asyncHandle(accessController.login));

/**
 * TODO: Authenticate before execute logout
 */
router.use(authentication);
router.post("/shop/logout", asyncHandle(accessController.logout));
router.post("/shop/rftoken", asyncHandle(accessController.handlerRefreshToken));

module.exports = router;
