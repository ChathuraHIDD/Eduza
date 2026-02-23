const router = require("express").Router();
const {
  createFeedback,
  getFeedbacks,
  updateFeedbackStatus,
} = require("../controllers/feedbackController");

router.post("/", createFeedback);
router.get("/", getFeedbacks);
router.patch("/:id/status", updateFeedbackStatus);

module.exports = router;
