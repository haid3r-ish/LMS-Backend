require("module-alias/register")

const express = require("express");

const authController = require("@controller/auth");
const auth  = require("@middleware/auth"); 

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", auth(), authController.logout);

router.post("/forgot-password", authController.requestPasswordReset);
router.patch("/reset-password", authController.resetPassword);
router.patch("/change-password", auth(), authController.changePassword);

module.exports = router;