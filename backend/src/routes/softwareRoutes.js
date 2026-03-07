const express = require("express");
const router = express.Router();

const {
  createSoftware,
  getSoftware,
} = require("../controllers/softwareController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createSoftware);
router.get("/:id", getSoftwareById);
module.exports = router;