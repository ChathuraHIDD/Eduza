const User = require("../models/User");
const ChatGroup = require("../models/ChatGroup");

// Search users by name or email
const searchUsers = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const currentUserId = req.user._id;

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("_id name email role")
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    console.error("searchUsers error:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
};

// Create or open direct chat
const createOrOpenDirectChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "Target user is required" });
    }

    const targetUser = await User.findById(userId).select("_id name email role");
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let existingChat = await ChatGroup.findOne({
      members: { $all: [currentUserId, userId] },
      $expr: { $eq: [{ $size: "$members" }, 2] },
    })
      .populate("members", "name email role")
      .populate("admins", "name email role")
      .populate("createdBy", "name email role");

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const currentUser = await User.findById(currentUserId).select("_id name");

    const newChat = await ChatGroup.create({
      name: `${currentUser.name} & ${targetUser.name}`,
      description: "Direct chat",
      members: [currentUserId, userId],
      admins: [currentUserId],
      createdBy: currentUserId,
    });

    const populatedChat = await ChatGroup.findById(newChat._id)
      .populate("members", "name email role")
      .populate("admins", "name email role")
      .populate("createdBy", "name email role");

    res.status(201).json(populatedChat);
  } catch (error) {
    console.error("createOrOpenDirectChat error:", error);
    res.status(500).json({ message: "Failed to create or open chat" });
  }
};

module.exports = {
  searchUsers,
  createOrOpenDirectChat,
};