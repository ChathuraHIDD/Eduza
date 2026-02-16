const router = require("express").Router();
const { generatePlan, getPlans } = require("../controllers/studyPlanController");

router.post("/generate", generatePlan);
router.get("/", getPlans);

module.exports = router;
