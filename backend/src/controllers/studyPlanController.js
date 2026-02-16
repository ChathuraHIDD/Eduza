const StudyPlan = require('../models/StudyPlan');
const asyncHandler = require('../middleware/asyncHandler');

const getStudyPlans = asyncHandler(async (req, res) => {
  const plans = await StudyPlan.find();
  res.json(plans);
});

const createStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.create(req.body);
  res.status(201).json(plan);
});

const updateStudyPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const plan = await StudyPlan.findByIdAndUpdate(id, req.body, { new: true });

  if (!plan) {
    res.status(404);
    throw new Error('Study plan not found');
  }

  res.json(plan);
});

module.exports = {
  getStudyPlans,
  createStudyPlan,
  updateStudyPlan,
};
