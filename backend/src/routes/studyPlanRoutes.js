const express = require('express');
const {
  getStudyPlans,
  createStudyPlan,
  updateStudyPlan,
} = require('../controllers/studyPlanController');

const router = express.Router();

router.route('/').get(getStudyPlans).post(createStudyPlan);
router.route('/:id').put(updateStudyPlan);

module.exports = router;
