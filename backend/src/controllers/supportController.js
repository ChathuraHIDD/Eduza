const SupportTicket = require('../models/SupportTicket');
const asyncHandler = require('../middleware/asyncHandler');

const getSupportTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find();
  res.json(tickets);
});

const createSupportTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.create(req.body);
  res.status(201).json(ticket);
});

const updateSupportTicketStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ticket = await SupportTicket.findByIdAndUpdate(
    id,
    { status: req.body.status },
    { new: true }
  );

  if (!ticket) {
    res.status(404);
    throw new Error('Support ticket not found');
  }

  res.json(ticket);
});

module.exports = {
  getSupportTickets,
  createSupportTicket,
  updateSupportTicketStatus,
};
