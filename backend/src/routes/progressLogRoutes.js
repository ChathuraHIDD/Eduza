const express = require("express");
const {
  getProgressLogs,
  createProgressLog,
} = require("../controllers/progressLogController");

const router = express.Router();

router.route("/").get(getProgressLogs).post(createProgressLog);

module.exports = router;