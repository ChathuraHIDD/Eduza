const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  searchUsers,
  createOrOpenDirectChat,
} = require("../controllers/chatUserController");

router.get("/search", protect, searchUsers);
router.post("/direct", protect, createOrOpenDirectChat);

module.exports = router;