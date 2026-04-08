const StudySession = require("../models/StudySession");
const ProgressLog = require("../models/ProgressLog");
const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");

const getOwnerCandidates = (user) => [String(user._id), String(user.email || '').toLowerCase()].filter(Boolean);

const isSessionOwner = (session, user) => {
  const ownerValue = String(session.user || '').toLowerCase();
  return getOwnerCandidates(user).map((value) => String(value).toLowerCase()).includes(ownerValue);
};

const formatMinutes = (minutes) => {
  const safeMinutes = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  if (hours > 0 && remainingMinutes > 0) return `${hours}h ${remainingMinutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${remainingMinutes}m`;
};

const createStudyNotification = async ({ user, title, message }) => {
  await Notification.create({
    studentId: user._id,
    channel: 'IN_APP',
    title,
    message,
    status: 'SENT',
    read: false,
  });
};

const getEffectiveMinutes = (session, now = new Date()) => {
  const startedAt = new Date(session.startTime).getTime();
  const pausedMinutes = Number(session.totalPausedMinutes || 0);
  const runningMinutes = Math.max(0, (now.getTime() - startedAt) / 60000 - pausedMinutes);
  return Math.max(0, Math.round(runningMinutes));
};

const getRemainingTodayMinutes = (session, effectiveMinutes) => {
  const planned = Number(session.plannedMinutesToday || 0);
  if (!planned) return null;
  return Math.max(0, planned - Number(effectiveMinutes || 0));
};

const buildNotificationMessage = (session, effectiveMinutes) => {
  const planned = Number(session.plannedMinutesToday || 0);
  const remaining = getRemainingTodayMinutes(session, effectiveMinutes);
  if (!planned) {
    return `${session.moduleName}: worked ${formatMinutes(effectiveMinutes)} so far.`;
  }

  return `${session.moduleName}: worked ${formatMinutes(effectiveMinutes)} of ${formatMinutes(planned)} today, ${formatMinutes(remaining)} left today.`;
};

const applySessionTiming = (session, now = new Date()) => {
  const effectiveMinutes = getEffectiveMinutes(session, now);
  session.durationMinutes = effectiveMinutes;
  return effectiveMinutes;
};

// GET /api/study-sessions?user=xxx&status=completed&limit=200
const getStudySessions = asyncHandler(async (req, res) => {
  const { status, moduleName, moduleId, studyPlanId, limit = 200 } = req.query;

  const filter = { user: String(req.user._id) };
  if (status) filter.status = status;
  if (moduleName) filter.moduleName = moduleName;
  if (moduleId) filter.moduleId = moduleId;
  if (studyPlanId) filter.studyPlanId = studyPlanId;

  const sessions = await StudySession.find(filter)
    .sort({ startTime: -1 })
    .limit(Number(limit));

  res.json(sessions);
});

// POST /api/study-sessions/start
const startStudySession = asyncHandler(async (req, res) => {
  const { studyPlanId, moduleId, moduleName, sessionType, notes, plannedMinutesToday, scheduleLabel, scheduleType } =
    req.body;

  if (!moduleName) {
    res.status(400);
    throw new Error("moduleName is required");
  }

  const session = await StudySession.create({
    user: String(req.user._id),
    studyPlanId: studyPlanId || null,
    moduleId: moduleId || null,
    moduleName,
    sessionType: sessionType || "learn",
    startTime: new Date(),
    status: "running",
    pausedAt: null,
    totalPausedMinutes: 0,
    plannedMinutesToday: Number(plannedMinutesToday || 0),
    scheduleLabel: scheduleLabel || "",
    scheduleType: scheduleType || sessionType || "learn",
    notes: notes || "",
  });

  await createStudyNotification({
    user: req.user,
    title: `Study started: ${session.moduleName}`,
    message: buildNotificationMessage(session, 0),
  });

  res.status(201).json(session);
});

// POST /api/study-sessions/pause/:id
const pauseStudySession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const session = await StudySession.findById(id);

  if (!session) {
    res.status(404);
    throw new Error("Study session not found");
  }

  if (!isSessionOwner(session, req.user)) {
    res.status(403);
    throw new Error("Not authorized to update this study session");
  }

  if (session.status === 'completed') {
    return res.json(session);
  }

  if (session.status !== 'paused') {
    const now = new Date();
    const effectiveMinutes = applySessionTiming(session, now);
    session.status = 'paused';
    session.pausedAt = now;
    await session.save();

    await createStudyNotification({
      user: req.user,
      title: `Study paused: ${session.moduleName}`,
      message: buildNotificationMessage(session, effectiveMinutes),
    });
  }

  res.json(session);
});

// POST /api/study-sessions/resume/:id
const resumeStudySession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const session = await StudySession.findById(id);

  if (!session) {
    res.status(404);
    throw new Error("Study session not found");
  }

  if (!isSessionOwner(session, req.user)) {
    res.status(403);
    throw new Error("Not authorized to update this study session");
  }

  if (session.status === 'completed') {
    return res.json(session);
  }

  if (session.status === 'paused' && session.pausedAt) {
    const now = new Date();
    const pausedMinutes = Math.max(0, Math.round((now.getTime() - new Date(session.pausedAt).getTime()) / 60000));
    session.totalPausedMinutes = Number(session.totalPausedMinutes || 0) + pausedMinutes;
    session.pausedAt = null;
    session.status = 'running';
    session.durationMinutes = getEffectiveMinutes(session, now);
    await session.save();

    await createStudyNotification({
      user: req.user,
      title: `Study resumed: ${session.moduleName}`,
      message: buildNotificationMessage(session, session.durationMinutes),
    });
  }

  res.json(session);
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

  if (!isSessionOwner(session, req.user)) {
    res.status(403);
    throw new Error("Not authorized to update this study session");
  }

  if (session.status === "completed") {
    return res.json(session);
  }

  const end = new Date();
  const durationMinutes = session.status === 'paused'
    ? Math.max(0, Math.round(Number(session.durationMinutes || 0)))
    : applySessionTiming(session, end);

  session.endTime = end;
  session.durationMinutes = durationMinutes;
  session.status = "completed";
  session.pausedAt = null;

  await session.save();

  await createStudyNotification({
    user: req.user,
    title: `Study finished: ${session.moduleName}`,
    message: `${session.moduleName}: worked ${formatMinutes(durationMinutes)} total. ${buildNotificationMessage(session, durationMinutes)}`,
  });

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
  pauseStudySession,
  resumeStudySession,
  stopStudySession,
};