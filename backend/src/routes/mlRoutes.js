const express = require("express");
const { predictTaskDuration } = require("../controllers/mlController");

const router = express.Router();

router.post("/task-duration/predict", predictTaskDuration);

module.exports = router;