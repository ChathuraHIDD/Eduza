const express = require("express");
const { getGpaProfile, upsertGpaProfile } = require("../controllers/gpaController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.route("/").get(getGpaProfile).put(upsertGpaProfile);

module.exports = router;
