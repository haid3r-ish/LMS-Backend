require("module-alias/register");
const express = require('express');
const router = express.Router();

const moduleController = require('@controller/module');
const contentController = require('@controller/content');
const reviewController = require('@controller/review');

const auth = require('@middleware/auth');
const { uploadToCloud, removeFromCloud, multerFieldSelector } = require('@middleware/cloudinary');

router.get('/my-modules',
  auth(),
  moduleController.getMyModules
);

// router.route('/:moduleId/reviews')
//   .get(reviewController.getReviews);

router.route('/')
  .get(moduleController.getModules)
  .post(
    auth('instructor'),
    multerFieldSelector,
    uploadToCloud,
    moduleController.createModule 
  );

router.route('/:moduleId')
  .get(moduleController.getModule)
  .patch(
    auth('instructor'),
    multerFieldSelector,
    uploadToCloud,
    moduleController.updateModule,
    removeFromCloud  
  )
  .delete(
    auth('instructor'),
    moduleController.deleteModule
  );

router.route('/:moduleId/content')
  .post(
    auth('instructor'),
    multerFieldSelector, 
    uploadToCloud,   
    contentController.addContent
  );

router.route('/:moduleId/content/:unitId')
  .patch(
    auth('instructor'),
    multerFieldSelector, 
    uploadToCloud,     
    contentController.updateContent, 
    removeFromCloud,   
  )
  .delete(
    auth('instructor'),
    contentController.removeContent,
    removeFromCloud,  
  );

module.exports = router;