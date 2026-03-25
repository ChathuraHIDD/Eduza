const ProfileUpdateRequest = require("../models/ProfileUpdateRequest");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

const ALLOWED_PROFILE_FIELDS = ["name", "email", "title", "department", "phone", "office", "hours", "bio"];

const pickAllowedProfileFields = (changes = {}) => {
  return Object.fromEntries(
    Object.entries(changes).filter(([key, value]) => ALLOWED_PROFILE_FIELDS.includes(key) && value !== undefined)
  );
};

// Submit profile update request
const submitProfileRequest = asyncHandler(async (req, res) => {
  const { requestType, detail, changes } = req.body;

  if (!["lecturer", "coordinator", "admin"].includes(req.user.role)) {
    res.status(403);
    throw new Error("Only staff users can submit profile update requests");
  }

  if (!detail) {
    res.status(400);
    throw new Error("Missing required field: detail");
  }

  const sanitizedChanges = pickAllowedProfileFields(changes || {});

  const request = await ProfileUpdateRequest.create({
    lecturerId: req.user._id,
    lecturerName: req.user.name,
    lecturerEmail: req.user.email,
    requestType: requestType || "Profile Update",
    detail,
    changes: sanitizedChanges,
    status: "pending",
  });

  res.status(201).json(request);
});

// Get all pending profile update requests (admin only)
const getPendingRequests = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only admins can view pending requests");
  }

  const requests = await ProfileUpdateRequest.find({ status: "pending" })
    .populate("lecturerId", "name email")
    .sort({ createdAt: -1 });

  res.json({
    count: requests.length,
    requests,
  });
});

// Get all profile update requests (admin only)
const getAllRequests = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only admins can view all requests");
  }

  const requests = await ProfileUpdateRequest.find()
    .populate("lecturerId", "name email")
    .populate("approvedBy", "name")
    .sort({ createdAt: -1 });

  res.json({
    count: requests.length,
    requests,
  });
});

// Get requests by lecturer
const getRequestsByLecturer = asyncHandler(async (req, res) => {
  const { lecturerId } = req.params;

  if (req.user.role !== "admin" && String(req.user._id) !== String(lecturerId)) {
    res.status(403);
    throw new Error("You can only view your own requests");
  }

  const requests = await ProfileUpdateRequest.find({ lecturerId })
    .sort({ createdAt: -1 });

  res.json({
    count: requests.length,
    requests,
  });
});

// Get single request
const getRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await ProfileUpdateRequest.findById(id)
    .populate("lecturerId", "name email")
    .populate("approvedBy", "name");

  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  res.json(request);
});

// Update request status (admin approval/rejection)
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;

  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only admins can approve/reject requests");
  }

  if (!["pending", "approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Status must be pending, approved, or rejected");
  }

  const request = await ProfileUpdateRequest.findById(id);

  if (!request) {
    res.status(404);
    throw new Error("Request not found");
  }

  request.status = status;
  request.adminNote = adminNote || "";

  if (status === "approved" || status === "rejected") {
    request.approvedAt = new Date();
    request.approvedBy = req.user._id;
  }

  if (status === "approved") {
    const updates = pickAllowedProfileFields(request.changes || {});
    if (Object.keys(updates).length > 0) {
      const duplicateEmailUser = updates.email
        ? await User.findOne({ email: updates.email.toLowerCase(), _id: { $ne: request.lecturerId } })
        : null;

      if (duplicateEmailUser) {
        res.status(400);
        throw new Error("Requested email is already in use by another account");
      }

      if (updates.email) {
        updates.email = updates.email.toLowerCase().trim();
      }

      await User.findByIdAndUpdate(request.lecturerId, updates, { new: true, runValidators: true });
    }
  }

  const updated = await request.save();
  res.json(updated);
});

module.exports = {
  submitProfileRequest,
  getPendingRequests,
  getAllRequests,
  getRequestsByLecturer,
  getRequestById,
  updateRequestStatus,
};
