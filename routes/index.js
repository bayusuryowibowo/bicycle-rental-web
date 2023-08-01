"use strict";
const express = require("express");
const Controller = require("../controllers");
const router = express.Router();
const auth = require("../middlewares/auth");

router.post("/register", Controller.register);
router.post("/login", Controller.login);
router.use(auth)

module.exports = router;
