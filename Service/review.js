require("module-alias/register")

const Review = require('@model/review');
const Enrollment = require('@model/enrollment');
const {AppError} = require('@util/errorHandler');

const createReviewService = async (moduleId, userId, rating, comment) => {
  // 1. Check if User is enrolled
  const isEnrolled = await Enrollment.exists({ module: moduleId, student: userId });
  if (!isEnrolled) throw new AppError('You must purchase the course to review it.', 403);

  // 3. Create Review
  const review = await Review.create({
    module: moduleId,
    user: userId,
    rating,
    comment
  });

  return review;
};

const getModuleReviewsService = async (moduleId) => {
  const reviews = await Review.find({ module: moduleId })
    .populate('user', 'name avatar') 
    .sort({ createdAt: -1 });
    
  return reviews;
};

const getModuleStatsService = async (moduleId) => {
  const stats = await Review.aggregate([
    { $match: { module: moduleId } }, 
    {
      $group: {
        _id: '$module',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : { nRating: 0, avgRating: 0 };
};

module.exports = {
  createReviewService,
  getModuleReviewsService,
  getModuleStatsService
};