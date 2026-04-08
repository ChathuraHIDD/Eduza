const express = require('express');
const {
  getStudyPlans,
  getStudyPlanById,
  createStudyPlan,
  updateStudyPlan,
} = require('../controllers/studyPlanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getStudyPlans).post(createStudyPlan);
router.route('/:id').get(getStudyPlanById).put(updateStudyPlan);

module.exports = router;
