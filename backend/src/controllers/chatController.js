const ChatGroup = require("../models/ChatGroup");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");

const isGroupMember = (group, userId) => {
  return group.members.some(
    (memberId) => memberId.toString() === userId.toString()
  );
};

const isGroupAdmin = (group, userId) => {
  return group.admins.some(
    (adminId) => adminId.toString() === userId.toString()
  );
};

const populateGroup = async (groupId) => {
  return ChatGroup.findById(groupId)
    .populate("members", "name email role")
    .populate("admins", "name email role")
    .populate("createdBy", "name email role");
};

const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await ChatGroup.find({ members: userId })
      .populate("members", "name email role")
      .populate("admins", "name email role")
      .sort({ updatedAt: -1 });

    const formattedGroups = await Promise.all(
      groups.map(async (group) => {
        const lastMessage = await ChatMessage.findOne({ group: group._id })
          .sort({ createdAt: -1 })
          .populate("sender", "name");

        return {
          _id: group._id,
          name: group.name,
          description: group.description,
          members: group.members,
          admins: group.admins,
          createdBy: group.createdBy,
          lastMessage: lastMessage
            ? lastMessage.type === "text"
              ? lastMessage.text
              : `${lastMessage.type} shared`
            : "No messages yet",
          updatedAt: group.updatedAt,
        };
      })
    );

    res.status(200).json(formattedGroups);
  } catch (error) {
    console.error("getMyGroups error:", error);
    res.status(500).json({ message: "Failed to load groups" });
  }
};

const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!isGroupMember(group, userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await ChatMessage.find({ group: groupId })
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("getGroupMessages error:", error);
    res.status(500).json({ message: "Failed to load messages" });
  }
};

const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, type, fileUrl, fileName, fileSize } = req.body;
    const userId = req.user._id;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!isGroupMember(group, userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const newMessage = await ChatMessage.create({
      group: groupId,
      sender: userId,
      text: text || "",
      type: type || "text",
      fileUrl: fileUrl || "",
      fileName: fileName || "",
      fileSize: fileSize || "",
    });

    const populatedMessage = await ChatMessage.findById(newMessage._id)
      .populate("sender", "name email role");

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("sendGroupMessage error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, members = [] } = req.body;
    const userId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const uniqueMembers = [...new Set([...members, userId.toString()])];

    const group = await ChatGroup.create({
      name: name.trim(),
      members: uniqueMembers,
      admins: [userId],
      createdBy: userId,
    });

    const populatedGroup = await populateGroup(group._id);
    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("createGroup error:", error);
    res.status(500).json({ message: "Failed to create group" });
  }
};

const createGroupWithMembers = async (req, res) => {
  try {
    const { name, memberIds = [] } = req.body;
    const currentUserId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const uniqueMembers = [
      ...new Set([currentUserId.toString(), ...memberIds.map(String)]),
    ];

    if (uniqueMembers.length < 2) {
      return res.status(400).json({
        message: "Please add at least one member to create a group",
      });
    }

    const group = await ChatGroup.create({
      name: name.trim(),
      description: "Group chat",
      members: uniqueMembers,
      admins: [currentUserId],
      createdBy: currentUserId,
    });

    const populatedGroup = await populateGroup(group._id);
    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("createGroupWithMembers error:", error);
    res.status(500).json({ message: "Failed to create group" });
  }
};

const renameGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!isGroupAdmin(group, userId)) {
      return res.status(403).json({ message: "Only admins can rename the group" });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    group.name = name.trim();
    if (typeof description === "string") {
      group.description = description.trim();
    }

    await group.save();

    const populatedGroup = await populateGroup(group._id);
    res.status(200).json(populatedGroup);
  } catch (error) {
    console.error("renameGroup error:", error);
    res.status(500).json({ message: "Failed to rename group" });
  }
};

const addMembersToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds = [] } = req.body;
    const userId = req.user._id;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!isGroupAdmin(group, userId)) {
      return res.status(403).json({ message: "Only admins can add members" });
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: "Please provide memberIds" });
    }

    const validUsers = await User.find({ _id: { $in: memberIds } }).select("_id");
    const validUserIds = validUsers.map((user) => user._id.toString());

    const updatedMembers = [
      ...new Set([
        ...group.members.map((id) => id.toString()),
        ...validUserIds,
      ]),
    ];

    group.members = updatedMembers;
    await group.save();

    const populatedGroup = await populateGroup(group._id);
    res.status(200).json(populatedGroup);
  } catch (error) {
    console.error("addMembersToGroup error:", error);
    res.status(500).json({ message: "Failed to add members" });
  }
};

const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, userId: memberToRemoveId } = req.params;
    const currentUserId = req.user._id;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!isGroupAdmin(group, currentUserId)) {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    if (memberToRemoveId.toString() === group.createdBy.toString()) {
      return res.status(400).json({ message: "Group creator cannot be removed" });
    }

    const updatedMembers = group.members.filter(
      (memberId) => memberId.toString() !== memberToRemoveId.toString()
    );

    if (updatedMembers.length < 2) {
      return res.status(400).json({
        message: "A group must have at least 2 members",
      });
    }

    group.members = updatedMembers;
    group.admins = group.admins.filter(
      (adminId) => adminId.toString() !== memberToRemoveId.toString()
    );

    await group.save();

    const populatedGroup = await populateGroup(group._id);
    res.status(200).json(populatedGroup);
  } catch (error) {
    console.error("removeMemberFromGroup error:", error);
    res.status(500).json({ message: "Failed to remove member" });
  }
};

const deleteGroupMessage = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const userId = req.user._id;

    const group = await ChatGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const message = await ChatMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.group.toString() !== groupId.toString()) {
      return res.status(400).json({ message: "Message does not belong to this group" });
    }

    const isSender = message.sender.toString() === userId.toString();
    const isAdmin = group.admins.some(
      (adminId) => adminId.toString() === userId.toString()
    );

    if (!isSender && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Only the sender or a group admin can delete this message" });
    }

    await ChatMessage.findByIdAndDelete(messageId);

    const lastMessage = await ChatMessage.findOne({ group: groupId })
      .sort({ createdAt: -1 });

    group.updatedAt = new Date();
    await group.save();

    res.status(200).json({
      message: "Message deleted successfully",
      deletedMessageId: messageId,
      lastMessageText: lastMessage
        ? lastMessage.type === "text"
          ? lastMessage.text
          : `${lastMessage.type} shared`
        : "No messages yet",
    });
  } catch (error) {
    console.error("deleteGroupMessage error:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
};

module.exports = {
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
  createGroup,
  createGroupWithMembers,
  renameGroup,
  addMembersToGroup,
  removeMemberFromGroup,
  deleteGroupMessage,
};