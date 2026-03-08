const StudyPlan = require('../models/StudyPlan');
const asyncHandler = require('../middleware/asyncHandler');
const {
  generateStudyPlanSchedule,
} = require('../services/studyPlanScheduler');

const getStudyPlans = asyncHandler(async (req, res) => {
  const plans = await StudyPlan.find();
  res.json(plans);
});

const createStudyPlan = asyncHandler(async (req, res) => {
  const { sessions, summary, modules } = generateStudyPlanSchedule(req.body);
  const planPayload = {
    ...req.body,
    modules,
    sessions,
    summary,
  };

  const plan = await StudyPlan.create(planPayload);
  res.status(201).json(plan);
});

const fieldsTriggeringRegeneration = [
  'modules',
  'availability',
  'preferences',
  'startDate',
  'targetDate',
  'scopeType',
  'targetGrade',
];

const updateStudyPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const plan = await StudyPlan.findById(id);

  if (!plan) {
    res.status(404);
    throw new Error('Study plan not found');
  }

  const shouldRegenerate =
    req.body.regenerate ||
    fieldsTriggeringRegeneration.some((field) => field in req.body);

  const merged = {
    ...plan.toObject(),
    ...req.body,
  };

  if (shouldRegenerate) {
    const { sessions, summary, modules } =
      generateStudyPlanSchedule(merged);
    merged.modules = modules;
    merged.sessions = sessions;
    merged.summary = summary;
  }

  delete merged._id;
  delete merged.createdAt;
  delete merged.updatedAt;

  plan.set(merged);
  await plan.save();

  res.json(plan);
});

module.exports = {
  getStudyPlans,
  createStudyPlan,
  updateStudyPlan,
};
