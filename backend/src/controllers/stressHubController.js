const asyncHandler = require('../middleware/asyncHandler');
const StressLog = require('../models/StressLog');
const User = require('../models/User');
const ProgressLog = require('../models/ProgressLog');
const RelaxationSession = require('../models/RelaxationSession');
const StressAlert = require('../models/StressAlert');
const Notification = require('../models/Notification');
const FutureSelfMessage = require('../models/FutureSelfMessage');
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
  if (req.user?.role === 'student') {
    query.studentId = req.user._id;
  } else if (studentId) {
    query.studentId = studentId;
  }

  const logs = await StressLog.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.json(logs);
});

const createStressLog = asyncHandler(async (req, res) => {
  const { selectedColors = [], recentActivities = [], notes } = req.body;

  if (!req.user || req.user.role !== 'student') {
    res.status(403);
    throw new Error('Only students can submit stress logs');
  }

  const studentId = req.user._id;

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
    activityType,
    durationMinutes,
    completed = true,
    metadata = {},
  } = req.body;

  if (!req.user || req.user.role !== 'student') {
    res.status(403);
    throw new Error('Only students can log relaxation sessions');
  }

  const studentId = req.user._id;

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

  if (req.user?.role === 'student') {
    query.studentId = req.user._id;
  } else if (studentId) {
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

  if (req.user?.role === 'student') {
    query.studentId = req.user._id;
  } else if (studentId) {
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
  if (req.user?.role === 'student') {
    query.studentId = req.user._id;
  } else if (studentId) {
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

const getStressAdminSummary = asyncHandler(async (req, res) => {
  const days = Math.max(1, Number(req.query.periodDays) || 30);
  const limit = Math.max(1, Math.min(30, Number(req.query.limit) || 12));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const logs = await StressLog.find({ createdAt: { $gte: since } })
    .populate('studentId', 'name email')
    .sort({ createdAt: -1 });

  const totals = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
  };
  const colorTotals = {
    RED: 0,
    ORANGE: 0,
    YELLOW: 0,
    GREEN: 0,
    BLUE: 0,
  };

  let stressScoreSum = 0;
  logs.forEach((log) => {
    if (totals[log.stressLevel] !== undefined) {
      totals[log.stressLevel] += 1;
    }
    const primaryColor = Array.isArray(log.selectedColors) && log.selectedColors.length > 0
      ? String(log.selectedColors[0]).toUpperCase()
      : null;
    if (primaryColor && colorTotals[primaryColor] !== undefined) {
      colorTotals[primaryColor] += 1;
    }
    stressScoreSum += Number(log.stressScore || 0);
  });

  const totalSubmissions = logs.length;
  const asPercent = (count) => {
    if (!totalSubmissions) return 0;
    return Number(((count / totalSubmissions) * 100).toFixed(1));
  };

  const recentSubmissions = logs.slice(0, limit).map((log) => ({
    id: log._id,
    studentId: log.studentId?._id || null,
    studentName: log.studentId?.name || 'Unknown student',
    studentEmail: log.studentId?.email || '',
    stressLevel: log.stressLevel,
    stressScore: log.stressScore,
    selectedColors: log.selectedColors,
    submittedAt: log.createdAt,
  }));

  res.json({
    periodDays: days,
    totalSubmissions,
    averageStressScore: totalSubmissions
      ? Number((stressScoreSum / totalSubmissions).toFixed(2))
      : 0,
    levelBreakdown: {
      LOW: { count: totals.LOW, percentage: asPercent(totals.LOW) },
      MEDIUM: { count: totals.MEDIUM, percentage: asPercent(totals.MEDIUM) },
      HIGH: { count: totals.HIGH, percentage: asPercent(totals.HIGH) },
    },
    colorBreakdown: {
      RED: { count: colorTotals.RED, percentage: asPercent(colorTotals.RED) },
      ORANGE: { count: colorTotals.ORANGE, percentage: asPercent(colorTotals.ORANGE) },
      YELLOW: { count: colorTotals.YELLOW, percentage: asPercent(colorTotals.YELLOW) },
      GREEN: { count: colorTotals.GREEN, percentage: asPercent(colorTotals.GREEN) },
      BLUE: { count: colorTotals.BLUE, percentage: asPercent(colorTotals.BLUE) },
    },
    recentSubmissions,
  });
});

const saveFutureSelfMessage = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'student') {
    res.status(403);
    throw new Error('Only students can save future-self messages');
  }

  const message = String(req.body?.message || '').trim();
  if (!message) {
    res.status(400);
    throw new Error('message is required');
  }

  const note = await FutureSelfMessage.findOneAndUpdate(
    { studentId: req.user._id },
    { message },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({
    id: note._id,
    studentId: note.studentId,
    message: note.message,
    updatedAt: note.updatedAt,
  });
});

const getFutureSelfMessage = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'student') {
    res.status(403);
    throw new Error('Only students can access future-self messages');
  }

  const note = await FutureSelfMessage.findOne({ studentId: req.user._id });
  if (!note) {
    return res.json({ message: '', updatedAt: null });
  }

  return res.json({
    message: note.message,
    updatedAt: note.updatedAt,
  });
});

const getCalmStreak = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'student') {
    res.status(403);
    throw new Error('Only students can access calm streak');
  }

  const logs = await StressLog.find({
    studentId: req.user._id,
    selectedColors: { $in: ['BLUE', 'GREEN'] },
  })
    .select('selectedColors createdAt')
    .sort({ createdAt: -1 })
    .limit(365);

  const daySet = new Set(
    logs.map((log) => new Date(log.createdAt).toISOString().slice(0, 10))
  );

  const sortedDays = Array.from(daySet).sort((a, b) => (a > b ? -1 : 1));
  const latestDay = sortedDays[0] || null;

  let streakDays = 0;
  if (latestDay) {
    const cursor = new Date(`${latestDay}T00:00:00.000Z`);
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (!daySet.has(key)) break;
      streakDays += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
  }

  let milestone = null;
  if (streakDays >= 30) {
    milestone = {
      level: '30_DAYS',
      badge: 'Calm Master Achievement',
      message: '30 day calm consistency unlocked. You built elite emotional stability.',
    };
  } else if (streakDays >= 14) {
    milestone = {
      level: '14_DAYS',
      badge: 'Deep Balance Badge',
      message: '14 day calm streak reached. Your consistency is becoming identity.',
    };
  } else if (streakDays >= 7) {
    milestone = {
      level: '7_DAYS',
      badge: 'Calm Consistency Badge',
      message: 'Great work. You have maintained calm or balance for 7 days in a row.',
    };
  }

  res.json({
    streakDays,
    lastCalmDay: latestDay,
    milestone,
  });
});

const getGuardianStudentStress = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'guardian') {
    res.status(403);
    throw new Error('Only guardians can access student stress data');
  }

  const email = String(req.query?.email || '').trim().toLowerCase();
  if (!email) {
    res.status(400);
    throw new Error('email query parameter is required');
  }

  const assignedEmails = Array.isArray(req.user.assignedStudentEmails)
    ? req.user.assignedStudentEmails.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean)
    : [];

  if (!assignedEmails.includes(email)) {
    res.status(403);
    throw new Error('You can only access your assigned students');
  }

  const student = await User.findOne({ email, role: 'student' }).select('_id name email');
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  const logs = await StressLog.find({ studentId: student._id })
    .select('selectedColors stressLevel stressScore createdAt')
    .sort({ createdAt: -1 })
    .limit(200);

  const progressLogs = await ProgressLog.find({
    user: { $in: [String(student._id), student.email] },
  })
    .select('moduleName progressPercent recordedAt')
    .sort({ recordedAt: -1 })
    .limit(400);

  const colorCounts = {
    RED: 0,
    ORANGE: 0,
    YELLOW: 0,
    GREEN: 0,
    BLUE: 0,
  };

  logs.forEach((log) => {
    const primaryColor = Array.isArray(log.selectedColors) && log.selectedColors.length > 0
      ? String(log.selectedColors[0]).toUpperCase()
      : null;
    if (primaryColor && colorCounts[primaryColor] !== undefined) {
      colorCounts[primaryColor] += 1;
    }
  });

  const marksByModule = new Map();
  progressLogs.forEach((log) => {
    const key = String(log.moduleName || 'General');
    if (!marksByModule.has(key)) {
      marksByModule.set(key, {
        moduleName: key,
        latestMark: Number(log.progressPercent || 0),
        updatedAt: log.recordedAt,
      });
    }
  });

  const moduleMarks = Array.from(marksByModule.values());
  const marksAverage = moduleMarks.length
    ? Number(
      (
        moduleMarks.reduce((sum, item) => sum + Number(item.latestMark || 0), 0) /
        moduleMarks.length
      ).toFixed(2)
    )
    : 0;

  res.json({
    student: {
      id: student._id,
      name: student.name,
      email: student.email,
    },
    stressLevelBars: [
      { key: 'RED', label: 'High Stress', value: colorCounts.RED },
      { key: 'ORANGE', label: 'Elevated', value: colorCounts.ORANGE },
      { key: 'YELLOW', label: 'Mild', value: colorCounts.YELLOW },
      { key: 'GREEN', label: 'Balanced', value: colorCounts.GREEN },
      { key: 'BLUE', label: 'Calm', value: colorCounts.BLUE },
    ],
    marks: {
      average: marksAverage,
      modulesCount: moduleMarks.length,
      modules: moduleMarks,
    },
    recentLogs: logs.slice(0, 12),
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
  getStressAdminSummary,
  saveFutureSelfMessage,
  getFutureSelfMessage,
  getCalmStreak,
  getGuardianStudentStress,
};
