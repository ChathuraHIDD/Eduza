const express = require('express');
const {
  getStressHubConfig,
  getStressLogs,
  createStressLog,
  createRelaxationSession,
  getRelaxationSessions,
  getStressAlerts,
  acknowledgeStressAlert,
  getWellnessDashboard,
} = require('../controllers/stressHubController');

const router = express.Router();

router.get('/config', getStressHubConfig);
router.get('/dashboard', getWellnessDashboard);

router.route('/stress-logs').get(getStressLogs).post(createStressLog);
router
  .route('/relaxation-sessions')
  .get(getRelaxationSessions)
  .post(createRelaxationSession);

router.get('/alerts', getStressAlerts);
router.patch('/alerts/:id/acknowledge', acknowledgeStressAlert);

module.exports = router;
