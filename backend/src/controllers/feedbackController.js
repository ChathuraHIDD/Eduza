const Feedback = require('../models/Feedback');
const asyncHandler = require('../middleware/asyncHandler');

const getFeedback = asyncHandler(async (req, res) => {
  const feedbackList = await Feedback.find();
  res.json(feedbackList);
});

const createFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.create(req.body);
  res.status(201).json(feedback);
});

module.exports = {
  getFeedback,
  createFeedback,
};
