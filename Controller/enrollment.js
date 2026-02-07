require("module-alias/register")

const {CatchAsync} = require("@util/errorHandler")
const enrollmentService = require("@service/enrollment")

const enrollStudent = CatchAsync(async (req, res) => {
  const enrollment = await enrollmentService.enrollStudentService(req.params.moduleId, req.user.id);
  res.status(201).send(enrollment);
});

const getMyEnrollments = CatchAsync(async (req, res) => {
  const enrollments = await enrollmentService.getStudentEnrollmentsService(req.user.id);
  res.status(200).send(enrollments);
});

const markUnitComplete = CatchAsync(async (req, res) => {
  const enrollment = await enrollmentService.markUnitCompleteService(
    req.params.enrollmentId,
    req.body.unitId,
    req.user.id
  );
  res.status(200).send(enrollment);
});

const submitQuiz = CatchAsync(async (req, res) => {
  const enrollment = await enrollmentService.submitQuizScoreService(
    req.params.enrollmentId,
    req.body.unitId,
    req.body.score,
    req.user.id
  );
  res.status(200).send(enrollment);
});

const getCourseContent = CatchAsync(async (req, res, next) => {
    const { module, progress } = await enrollmentService.getCourseContentService(
        req.user.id, 
        req.params.moduleId
    );

    res.status(200).json({
        success: true,
        data: {
            details: module,
            studentProgress: progress
        }
    });
});

module.exports = {
  enrollStudent,
  getMyEnrollments,
  markUnitComplete,
  submitQuiz,
  getCourseContent
};