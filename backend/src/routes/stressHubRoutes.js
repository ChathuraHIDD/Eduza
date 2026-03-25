const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/stressHubController');

const router = express.Router();

router.get('/config', protect, getStressHubConfig);
router.get('/dashboard', protect, getWellnessDashboard);
router.get('/admin/summary', protect, authorizeRoles('admin', 'coordinator'), getStressAdminSummary);

router
  .route('/stress-logs')
  .get(protect, getStressLogs)
  .post(protect, authorizeRoles('student'), createStressLog);
router
  .route('/relaxation-sessions')
  .get(protect, getRelaxationSessions)
  .post(protect, authorizeRoles('student'), createRelaxationSession);

router.get('/alerts', protect, getStressAlerts);
router.patch('/alerts/:id/acknowledge', protect, acknowledgeStressAlert);

router
  .route('/future-self-message')
  .get(protect, authorizeRoles('student'), getFutureSelfMessage)
  .post(protect, authorizeRoles('student'), saveFutureSelfMessage);

router.get('/calm-streak', protect, authorizeRoles('student'), getCalmStreak);
router.get('/guardian/student-stress', protect, authorizeRoles('guardian'), getGuardianStudentStress);

module.exports = router;
