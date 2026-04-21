const asyncHandler = require("../middleware/asyncHandler");
const ProgressAssessment = require("../models/ProgressAssessment");
const ProgressAssessmentAttempt = require("../models/ProgressAssessmentAttempt");

const STAFF_ROLES = ["lecturer", "coordinator", "admin"];

const canManageAssessment = (assessment, user) => {
  if (!assessment || !user) return false;
  if (user.role === "admin" || user.role === "coordinator") return true;
  return String(assessment.createdBy) === String(user._id);
};

const listAssessments = asyncHandler(async (req, res) => {
  const { type, moduleId } = req.query;
  const filter = {};

  if (type) filter.type = type;
  if (moduleId) filter.moduleId = moduleId;

  const assessments = await ProgressAssessment.find(filter).sort({ createdAt: -1 });
  res.json(assessments);
});

const createAssessment = asyncHandler(async (req, res) => {
  if (!STAFF_ROLES.includes(req.user?.role)) {
    res.status(403);
    throw new Error("Only staff users can create assessments");
  }

  const payload = req.body || {};

  if (!payload.type || !["quiz", "selfcheck"].includes(payload.type)) {
    res.status(400);
    throw new Error("type must be quiz or selfcheck");
  }

  if (!payload.moduleId || !payload.moduleName) {
    res.status(400);
    throw new Error("moduleId and moduleName are required");
  }

  if (payload.type === "quiz") {
    const questions = Array.isArray(payload.questions) ? payload.questions : [];
    if (questions.length === 0) {
      res.status(400);
      throw new Error("Quiz must include questions");
    }
  }

  if (payload.type === "selfcheck") {
    const outcomes = Array.isArray(payload.learningOutcomes)
      ? payload.learningOutcomes
      : [];
    if (outcomes.length === 0) {
      res.status(400);
      throw new Error("Self-check must include learning outcomes");
    }
  }

  const created = await ProgressAssessment.create({
    ...payload,
    createdBy: String(req.user._id),
  });

  res.status(201).json(created);
});

const updateAssessment = asyncHandler(async (req, res) => {
  const assessment = await ProgressAssessment.findById(req.params.id);

  if (!assessment) {
    res.status(404);
    throw new Error("Assessment not found");
  }

  if (!canManageAssessment(assessment, req.user)) {
    res.status(403);
    throw new Error("Not authorized to update this assessment");
  }

  const allowed = [
    "status",
    "score",
    "questionCount",
    "questions",
    "learningOutcomes",
    "moduleName",
    "moduleCode",
  ];

  allowed.forEach((key) => {
    if (req.body[key] !== undefined) assessment[key] = req.body[key];
  });

  const updated = await assessment.save();
  res.json(updated);
});

const deleteAssessment = asyncHandler(async (req, res) => {
  const assessment = await ProgressAssessment.findById(req.params.id);

  if (!assessment) {
    res.status(404);
    throw new Error("Assessment not found");
  }

  if (!canManageAssessment(assessment, req.user)) {
    res.status(403);
    throw new Error("Not authorized to delete this assessment");
  }

  await ProgressAssessmentAttempt.deleteMany({ assessmentId: assessment._id });
  await assessment.deleteOne();

  res.json({ message: "Assessment removed" });
});

const listAttempts = asyncHandler(async (req, res) => {
  const { assessmentId, quizId, moduleId, limit = 500 } = req.query;
  const filter = {
    user: String(req.user._id),
  };

  if (assessmentId) filter.assessmentId = assessmentId;
  if (quizId) filter.quizId = quizId;
  if (moduleId) filter.moduleId = moduleId;

  const attempts = await ProgressAssessmentAttempt.find(filter)
    .sort({ submittedAt: -1 })
    .limit(Number(limit));

  res.json(attempts);
});

const createAttempt = asyncHandler(async (req, res) => {
  const payload = req.body || {};

  if (!payload.assessmentId || !payload.moduleName || payload.score100 === undefined) {
    res.status(400);
    throw new Error("assessmentId, moduleName, and score100 are required");
  }

  const assessment = await ProgressAssessment.findById(payload.assessmentId);
  if (!assessment) {
    res.status(404);
    throw new Error("Assessment not found");
  }

  const attemptNumber =
    (await ProgressAssessmentAttempt.countDocuments({
      user: String(req.user._id),
      assessmentId: assessment._id,
    })) + 1;

  const attempt = await ProgressAssessmentAttempt.create({
    ...payload,
    user: String(req.user._id),
    assessmentId: assessment._id,
    quizId: String(payload.quizId || assessment._id),
    moduleId: payload.moduleId || assessment.moduleId || "",
    moduleCode: payload.moduleCode || assessment.moduleCode || "",
    moduleName: payload.moduleName || assessment.moduleName,
    assessmentType: payload.assessmentType || assessment.type,
    attemptNumber,
    submittedAt: payload.submittedAt ? new Date(payload.submittedAt) : new Date(),
  });

  res.status(201).json(attempt);
});

const updateAttempt = asyncHandler(async (req, res) => {
  const attempt = await ProgressAssessmentAttempt.findById(req.params.id);

  if (!attempt) {
    res.status(404);
    throw new Error("Attempt not found");
  }

  if (String(attempt.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to update this attempt");
  }

  const allowed = ["confidenceLevel", "reflection", "score100", "correctCount", "wrongCount"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) attempt[key] = req.body[key];
  });

  const updated = await attempt.save();
  res.json(updated);
});

module.exports = {
  listAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  listAttempts,
  createAttempt,
  updateAttempt,
};
