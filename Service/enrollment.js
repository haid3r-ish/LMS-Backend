require("module-alias/register")

const Enrollment = require('@model/enrollment');
const Module = require('@model/module');
const {AppError} = require('@util/errorHandler');

const enrollStudentService = async (moduleId, userId) => {
  const module = await Module.findById(moduleId);
  if (!module) throw new AppError('Module not found', 404);

  const existingEnrollment = await Enrollment.findOne({ module: moduleId, student: userId });
  if (existingEnrollment) throw new AppError('Student already enrolled', 400);

  const enrollment = await Enrollment.create({
    module: moduleId,
    student: userId,
    completedUnits: [],
    quizScores: []
  });

  return enrollment;
};

const getStudentEnrollmentsService = async (userId) => {
  const enrollments = await Enrollment.find({ student: userId })
    .populate('module', 'title thumbnail instructor') 
    .populate('student', 'name email');
  return enrollments;
};

const markUnitCompleteService = async (enrollmentId, unitId, userId) => {
  const enrollment = await Enrollment.findOne({ _id: enrollmentId, student: userId }).populate('module');
  if (!enrollment) throw new AppError('Enrollment not found', 404);

  if (!enrollment.completedUnits.includes(unitId)) {
    enrollment.completedUnits.push(unitId);
  }
 
  const totalUnits = enrollment.module.content.length;
  const completedCount = enrollment.completedUnits.length;

  if (completedCount === totalUnits) {
    enrollment.isCompleted = true;
    // Here we will allow to get certificate
  }

  await enrollment.save();
  return enrollment;
};

const getCourseContentService = async (userId, moduleId) => {
    // 1. Check if the student actually bought this course
    const enrollment = await Enrollment.findOne({ 
        student: userId, 
        module: moduleId 
    });

    if (!enrollment) {
        throw new AppError('You are not enrolled in this course. Please purchase it first.', 403);
    }

    // 2. Fetch the full module content (Videos, URLs, PDFs)
    // Since they are enrolled, we allow them to see the 'content' array.
    const module = await Module.findById(moduleId).select('+content'); 

    if (!module) {
        throw new AppError('Module content not found', 404);
    }

    return {
        module: module,
        progress: enrollment.completedVideos // Return progress so UI can show checkmarks
    };
};

const submitQuizScoreService = async (enrollmentId, unitId, score, userId) => {
  const enrollment = await Enrollment.findOne({ _id: enrollmentId, student: userId });
  if (!enrollment) throw new AppError('Enrollment not found', 404);

  // Remove old score for this quiz if it exists (allow retakes)
  enrollment.quizScores = enrollment.quizScores.filter(q => q.unitId.toString() !== unitId);

  // Add new score
  enrollment.quizScores.push({ unitId, score });

  // If passed (e.g. > 50%), mark as complete automatically
  if (score >= 70) {
    if (!enrollment.completedUnits.includes(unitId)) {
      enrollment.completedUnits.push(unitId);
    }
  }

  await enrollment.save();
  return enrollment;
};

module.exports = {
  enrollStudentService,
  getStudentEnrollmentsService,
  markUnitCompleteService,
  submitQuizScoreService,
  getCourseContentService
};