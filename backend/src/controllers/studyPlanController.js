const StudyPlan = require('../models/StudyPlan');
const asyncHandler = require('../middleware/asyncHandler');
const {
  generateStudyPlanSchedule,
} = require('../services/studyPlanScheduler');

const getOwnerCandidates = (user) => {
  const values = [String(user._id)];
  if (user.email) values.push(String(user.email).toLowerCase());
  return values;
};

const buildOwnerFilter = (user) => ({
  user: { $in: getOwnerCandidates(user) },
});

const isPlanOwner = (plan, user) => {
  const ownerValue = String(plan.user || '').toLowerCase();
  return getOwnerCandidates(user).map((v) => String(v).toLowerCase()).includes(ownerValue);
};

const getStudyPlans = asyncHandler(async (req, res) => {
  const plans = await StudyPlan.find(buildOwnerFilter(req.user)).sort({ createdAt: -1 });
  res.json(plans);
});

const getStudyPlanById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const plan = await StudyPlan.findById(id);

  if (!plan) {
    res.status(404);
    throw new Error('Study plan not found');
  }

  if (!isPlanOwner(plan, req.user)) {
    res.status(403);
    throw new Error('Not authorized to view this study plan');
  }

  res.json(plan);
});

const createStudyPlan = asyncHandler(async (req, res) => {
  const safePayload = {
    ...req.body,
    user: String(req.user._id),
  };

  const { sessions, summary, modules } = generateStudyPlanSchedule(safePayload);
  const planPayload = {
    ...safePayload,
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

  if (!isPlanOwner(plan, req.user)) {
    res.status(403);
    throw new Error('Not authorized to update this study plan');
  }

  const shouldRegenerate =
    req.body.regenerate ||
    fieldsTriggeringRegeneration.some((field) => field in req.body);

  const merged = {
    ...plan.toObject(),
    ...req.body,
    user: String(plan.user),
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

const deleteStudyPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const plan = await StudyPlan.findById(id);

  if (!plan) {
    res.status(404);
    throw new Error('Study plan not found');
  }

  if (!isPlanOwner(plan, req.user)) {
    res.status(403);
    throw new Error('Not authorized to delete this study plan');
  }

  await plan.deleteOne();
  res.json({ message: 'Study plan deleted successfully' });
});

module.exports = {
  getStudyPlans,
  getStudyPlanById,
  createStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
};
