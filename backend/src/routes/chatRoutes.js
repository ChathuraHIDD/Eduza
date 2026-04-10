const express = require("express");
const router = express.Router();

const {
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
  createGroup,
  createGroupWithMembers,
  renameGroup,
  addMembersToGroup,
  removeMemberFromGroup,
} = require("../controllers/chatController");

const { protect } = require("../middleware/authMiddleware");

router.get("/groups", protect, getMyGroups);
router.post("/groups", protect, createGroup);
router.post("/groups/create-with-members", protect, createGroupWithMembers);

router.patch("/groups/:groupId", protect, renameGroup);
router.post("/groups/:groupId/members", protect, addMembersToGroup);
router.delete("/groups/:groupId/members/:userId", protect, removeMemberFromGroup);

router.get("/groups/:groupId/messages", protect, getGroupMessages);
router.post("/groups/:groupId/messages", protect, sendGroupMessage);

module.exports = router;