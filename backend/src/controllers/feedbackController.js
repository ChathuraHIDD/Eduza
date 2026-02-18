const Feedback = require("../models/Feedback");
const asyncHandler = require("../middleware/asyncHandler");

// POST /api/feedback
exports.createFeedback = asyncHandler(async (req, res) => {
  const { studentId, category, target, message, rating } = req.body;

  if (!category || !message) {
    res.status(400);
    throw new Error("category and message are required");
  }

  const fb = await Feedback.create({ studentId, category, target, message, rating });
  res.status(201).json(fb);
});

// GET /api/feedback?category=SYSTEM&status=NEW
exports.getFeedbacks = asyncHandler(async (req, res) => {
  const { category, status } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;

  const list = await Feedback.find(filter).sort({ createdAt: -1 });
  res.json(list);
});

// PATCH /api/feedback/:id/status
exports.updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["NEW", "IN_REVIEW", "RESOLVED"];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const fb = await Feedback.findById(req.params.id);
  if (!fb) {
    res.status(404);
    throw new Error("Feedback not found");
  }

  fb.status = status;
  await fb.save();
  res.json(fb);
});
