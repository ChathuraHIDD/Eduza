const express = require("express");
const router = express.Router();

const {
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
  createGroup
} = require("../controllers/chatController");

const { protect } = require("../middleware/authMiddleware");

router.get("/groups", protect, getMyGroups);
router.post("/groups", protect, createGroup);
router.get("/groups/:groupId/messages", protect, getGroupMessages);
router.post("/groups/:groupId/messages", protect, sendGroupMessage);

module.exports = router;