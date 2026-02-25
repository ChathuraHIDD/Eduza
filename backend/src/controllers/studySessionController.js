const StudySession = require("../models/StudySession");
const ProgressLog = require("../models/ProgressLog");
const asyncHandler = require("../middleware/asyncHandler");

// GET /api/study-sessions?user=xxx&status=completed&limit=200
const getStudySessions = asyncHandler(async (req, res) => {
  const { user, status, moduleName, moduleId, limit = 200 } = req.query;

  const filter = {};
  if (user) filter.user = user;
  if (status) filter.status = status;
  if (moduleName) filter.moduleName = moduleName;
  if (moduleId) filter.moduleId = moduleId;

  const sessions = await StudySession.find(filter)
    .sort({ startTime: -1 })
    .limit(Number(limit));

  res.json(sessions);
});

// POST /api/study-sessions/start
const startStudySession = asyncHandler(async (req, res) => {
  const { user, studyPlanId, moduleId, moduleName, sessionType, notes } =
    req.body;

  if (!user || !moduleName) {
    res.status(400);
    throw new Error("user and moduleName are required");
  }

  const session = await StudySession.create({
    user,
    studyPlanId: studyPlanId || null,
    moduleId: moduleId || null,
    moduleName,
    sessionType: sessionType || "learn",
    startTime: new Date(),
    status: "running",
    notes: notes || "",
  });

  res.status(201).json(session);
});

// POST /api/study-sessions/stop/:id
const stopStudySession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { progressPercent, createProgressLog = true } = req.body;

  const session = await StudySession.findById(id);

  if (!session) {
    res.status(404);
    throw new Error("Study session not found");
  }

  if (session.status === "completed") {
    return res.json(session);
  }

  const end = new Date();
  const durationMs = end.getTime() - new Date(session.startTime).getTime();
  const durationMinutes = Math.max(0, Math.round(durationMs / 60000));

  session.endTime = end;
  session.durationMinutes = durationMinutes;
  session.status = "completed";

  await session.save();

  // OPTIONAL: when session ends, you can attach a progress log entry from stopwatch
  // (useful for ML dataset creation later)
  if (createProgressLog && progressPercent !== undefined) {
    await ProgressLog.create({
      user: session.user,
      studyPlanId: session.studyPlanId || null,
      moduleId: session.moduleId || null,
      moduleName: session.moduleName,
      progressPercent,
      source: "stopwatch",
      recordedAt: end,
    });
  }

  res.json(session);
});

module.exports = {
  getStudySessions,
  startStudySession,
  stopStudySession,
};