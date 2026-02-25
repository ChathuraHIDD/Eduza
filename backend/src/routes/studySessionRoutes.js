const express = require("express");
const {
  getStudySessions,
  startStudySession,
  stopStudySession,
} = require("../controllers/studySessionController");

const router = express.Router();

router.get("/", getStudySessions);
router.post("/start", startStudySession);
router.post("/stop/:id", stopStudySession);

module.exports = router;