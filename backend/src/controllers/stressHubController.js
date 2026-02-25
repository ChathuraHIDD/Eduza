const asyncHandler = require('../middleware/asyncHandler');
const StressLog = require('../models/StressLog');
const RelaxationSession = require('../models/RelaxationSession');
const StressAlert = require('../models/StressAlert');
const Notification = require('../models/Notification');
const {
  COLOR_IMPACTS,
  GAME_CONFIG,
  analyzeStressByColors,
  getSmartSuggestions,
  calculateRelaxationPoints,
} = require('../services/stressHubService');

const getStressHubConfig = asyncHandler(async (req, res) => {
  res.json({
    colors: COLOR_IMPACTS,
    games: GAME_CONFIG,
  });
});

const getStressLogs = asyncHandler(async (req, res) => {
  const { studentId, limit = 30 } = req.query;

  const query = {};
  if (studentId) {
    query.studentId = studentId;
  }

  const logs = await StressLog.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.json(logs);
});

const createStressLog = asyncHandler(async (req, res) => {
  const { studentId, selectedColors = [], recentActivities = [], notes } = req.body;

  if (!Array.isArray(selectedColors) || selectedColors.length === 0 || selectedColors.length > 5) {
    res.status(400);
    throw new Error('selectedColors must contain between 1 and 5 colors');
  }

  const { normalizedColors, stressScore, stressLevel, colorInsights } =
    analyzeStressByColors(selectedColors);

  const stressLog = await StressLog.create({
    studentId,
    selectedColors: normalizedColors,
    recentActivities,
    notes,
    stressScore,
    stressLevel,
  });

  let alert = null;

  if (stressLevel === 'HIGH') {
    const suggestedActions = getSmartSuggestions(stressLevel);

    alert = await StressAlert.create({
      studentId,
      stressLogId: stressLog._id,
      title: 'High Stress Detected',
      message: 'Your stress level is high. Take a short guided break now.',
      suggestedActions,
    });

    await Notification.create({
      studentId,
      channel: 'IN_APP',
      title: 'Stress Management Alert',
      message: `High stress detected (score: ${stressScore}). Suggested break activities are ready.`,
      status: 'SENT',
    });
  }

  res.status(201).json({
    stressLog,
    colorInsights,
    alert,
  });
});

const createRelaxationSession = asyncHandler(async (req, res) => {
  const {
    studentId,
    activityType,
    durationMinutes,
    completed = true,
    metadata = {},
  } = req.body;

  if (!GAME_CONFIG[activityType]) {
    res.status(400);
    throw new Error('Invalid activityType');
  }

  if (!durationMinutes || Number(durationMinutes) <= 0) {
    res.status(400);
    throw new Error('durationMinutes must be greater than 0');
  }

  const pointsEarned = calculateRelaxationPoints(
    activityType,
    Number(durationMinutes),
    completed
  );

  const session = await RelaxationSession.create({
    studentId,
    activityType,
    durationMinutes,
    completed,
    pointsEarned,
    metadata,
  });

  res.status(201).json(session);
});

const getRelaxationSessions = asyncHandler(async (req, res) => {
  const { studentId, limit = 30 } = req.query;
  const query = {};

  if (studentId) {
    query.studentId = studentId;
  }

  const sessions = await RelaxationSession.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.json(sessions);
});

const getStressAlerts = asyncHandler(async (req, res) => {
  const { studentId, status } = req.query;
  const query = {};

  if (studentId) {
    query.studentId = studentId;
  }

  if (status) {
    query.status = String(status).toUpperCase();
  }

  const alerts = await StressAlert.find(query).sort({ createdAt: -1 });
  res.json(alerts);
});

const acknowledgeStressAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const alert = await StressAlert.findByIdAndUpdate(
    id,
    { status: 'ACKNOWLEDGED' },
    { new: true }
  );

  if (!alert) {
    res.status(404);
    throw new Error('Stress alert not found');
  }

  res.json(alert);
});

const getWellnessDashboard = asyncHandler(async (req, res) => {
  const { studentId, periodDays = 14 } = req.query;
  const days = Math.max(1, Number(periodDays) || 14);

  const query = {};
  if (studentId) {
    query.studentId = studentId;
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [logs, sessions, openAlerts] = await Promise.all([
    StressLog.find({ ...query, createdAt: { $gte: since } }).sort({ createdAt: 1 }),
    RelaxationSession.find({ ...query, createdAt: { $gte: since } }),
    StressAlert.find({ ...query, status: 'OPEN', createdAt: { $gte: since } }),
  ]);

  const groupedTrends = logs.reduce((acc, log) => {
    const day = log.createdAt.toISOString().split('T')[0];
    if (!acc[day]) {
      acc[day] = { day, totalScore: 0, count: 0 };
    }
    acc[day].totalScore += log.stressScore;
    acc[day].count += 1;
    return acc;
  }, {});

  const trends = Object.values(groupedTrends).map((item) => ({
    day: item.day,
    averageStressScore: Number((item.totalScore / item.count).toFixed(2)),
    entries: item.count,
  }));

  const totalRelaxationMinutes = sessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0
  );
  const totalPoints = sessions.reduce((sum, session) => sum + session.pointsEarned, 0);

  const latestStressLog = logs.length > 0 ? logs[logs.length - 1] : null;

  res.json({
    periodDays: days,
    latestStressLog,
    stressTrends: trends,
    stressEntriesCount: logs.length,
    openHighStressAlerts: openAlerts.length,
    relaxationSummary: {
      sessionsCount: sessions.length,
      totalRelaxationMinutes,
      totalPoints,
    },
    suggestedBreaks: getSmartSuggestions(
      latestStressLog ? latestStressLog.stressLevel : 'MEDIUM'
    ),
  });
});

module.exports = {
  getStressHubConfig,
  getStressLogs,
  createStressLog,
  createRelaxationSession,
  getRelaxationSessions,
  getStressAlerts,
  acknowledgeStressAlert,
  getWellnessDashboard,
};
