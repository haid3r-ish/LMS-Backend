require("module-alias/register")

const express = require('express');
const router = express.Router();
const userController = require("@controller/user");
const auth = require('@middleware/auth');
const { upload, uploadToCloud } = require('@middleware/cloudinary');

router.use(auth());

router.get('/me', userController.getMe);

router.patch(
  '/me', 
  userController.updateMe
);

router.get(
  '/my-courses', 
  auth('instructor'), 
  userController.getMyTeachingCourses
);

router.delete('/deleteMe', userController.deleteMe);

module.exports = router;