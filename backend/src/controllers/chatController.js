const ChatGroup = require("../models/ChatGroup");
const ChatMessage = require("../models/ChatMessage");

const getMyGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const groups = await ChatGroup.find({ members: userId })
            .populate("members", "name email role")
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

        const isMember = group.members.some(
            (memberId) => memberId.toString() === userId.toString()
        );

        if (!isMember) {
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

        const isMember = group.members.some(
            (memberId) => memberId.toString() === userId.toString()
        );

        if (!isMember) {
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

        const populatedGroup = await ChatGroup.findById(group._id)
            .populate("members", "name email role")
            .populate("admins", "name email role")
            .populate("createdBy", "name email role");

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

        const populatedGroup = await ChatGroup.findById(group._id)
            .populate("members", "name email role")
            .populate("admins", "name email role")
            .populate("createdBy", "name email role");

        res.status(201).json(populatedGroup);
    } catch (error) {
        console.error("createGroupWithMembers error:", error);
        res.status(500).json({ message: "Failed to create group" });
    }
};

module.exports = {
    getMyGroups,
    getGroupMessages,
    sendGroupMessage,
    createGroup,
    createGroupWithMembers,
};