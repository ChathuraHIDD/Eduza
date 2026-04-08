const express = require("express");
const {
  getStudySessions,
  startStudySession,
  pauseStudySession,
  resumeStudySession,
  stopStudySession,
} = require("../controllers/studySessionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getStudySessions);
router.post("/start", startStudySession);
router.post("/pause/:id", pauseStudySession);
router.post("/resume/:id", resumeStudySession);
router.post("/stop/:id", stopStudySession);

module.exports = router;