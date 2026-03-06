const SupportTicket = require("../models/SupportTicket");
const asyncHandler = require("../middleware/asyncHandler");

// POST /api/support
exports.createTicket = asyncHandler(async (req, res) => {
  const { studentId, type, topic, message, priority } = req.body;

  if (!type || !topic || !message) {
    res.status(400);
    throw new Error("type, topic, message are required");
  }

  const ticket = await SupportTicket.create({ studentId, type, topic, message, priority });

  // Here later: if OFFICER -> trigger email/sms alert to officer/admin

  res.status(201).json(ticket);
});

// GET /api/support?status=OPEN
exports.getTickets = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;

  const list = await SupportTicket.find(filter).sort({ createdAt: -1 });
  res.json(list);
});

// PATCH /api/support/:id/status
exports.updateTicketStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["OPEN", "IN_PROGRESS", "CLOSED"];
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  ticket.status = status;
  await ticket.save();
  res.json(ticket);
});
