const express = require("express");
const router = express.Router();

const {
  createSoftware,
  getSoftware,
  getSoftwareById,
} = require("../controllers/softwareController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createSoftware);
router.get("/", getSoftware);
router.get("/:id", getSoftwareById);

module.exports = router;