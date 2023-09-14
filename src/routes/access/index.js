"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const router = express.Router();
const { asyncHandler } = require("../../auth/checkAuth");
//sign up
router.post("/shop/signup", asyncHandler(accessController.signup));
router.post("/shop/login", asyncHandler(accessController.login));

module.exports = router;
