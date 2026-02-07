require("module-alias/register")

const {CatchAsync} = require('@util/errorHandler');
const reviewService = require('@service/review');

const createReview = CatchAsync(async (req, res) => {
  const review = await reviewService.createReviewService(
    req.params.moduleId,
    req.user.id,
    req.body.rating,
    req.body.comment
  );
  res.status(201).send(review);
});

const getReviews = CatchAsync(async (req, res) => {
  const reviews = await reviewService.getModuleReviewsService(req.params.moduleId);
  res.status(200).send(reviews);
});

module.exports = {
  createReview,
  getReviews
};