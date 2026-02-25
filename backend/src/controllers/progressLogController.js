const ProgressLog = require("../models/ProgressLog");
const asyncHandler = require("../middleware/asyncHandler");

// GET /api/progress-logs?user=xxx&moduleName=yyy&limit=200
const getProgressLogs = asyncHandler(async (req, res) => {
  const { user, moduleName, moduleId, limit = 200 } = req.query;

  const filter = {};
  if (user) filter.user = user;
  if (moduleName) filter.moduleName = moduleName;
  if (moduleId) filter.moduleId = moduleId;

  const logs = await ProgressLog.find(filter)
    .sort({ recordedAt: -1 })
    .limit(Number(limit));

  res.json(logs);
});

// POST /api/progress-logs
const createProgressLog = asyncHandler(async (req, res) => {
  const { user, studyPlanId, moduleId, moduleName, progressPercent, source } =
    req.body;

  if (!user || !moduleName || progressPercent === undefined) {
    res.status(400);
    throw new Error("user, moduleName, and progressPercent are required");
  }

  const log = await ProgressLog.create({
    user,
    studyPlanId: studyPlanId || null,
    moduleId: moduleId || null,
    moduleName,
    progressPercent,
    source: source || "manual",
    recordedAt: new Date(),
  });

  res.status(201).json(log);
});

module.exports = {
  getProgressLogs,
  createProgressLog,
};