require("module-alias/register")

const express = require("express");
const router = express.Router()

const enrollmentController = require("@controller/enrollment");
const auth = require("@middleware/auth"); 

router.use(auth()); 

router.post('/:moduleId', enrollmentController.enrollStudent);

router.get('/my-courses', enrollmentController.getMyEnrollments);

router.post('/:enrollmentId/complete', enrollmentController.markUnitComplete);

router.post('/:enrollmentId/quiz', enrollmentController.submitQuiz);

module.exports = router;