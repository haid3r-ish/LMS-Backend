require("module-alias/register")

const express = require("express");

const reviewController = require("@controller/review");
const auth = require("@middleware/auth");

const router = express.Router()

router.post(
  '/:moduleId', 
  auth(), 
  reviewController.createReview
);

module.exports = router;