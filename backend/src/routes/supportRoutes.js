const express = require('express');
const {
  getSupportTickets,
  createSupportTicket,
  updateSupportTicketStatus,
} = require('../controllers/supportController');

const router = express.Router();

router.route('/').get(getSupportTickets).post(createSupportTicket);
router.route('/:id').patch(updateSupportTicketStatus);

module.exports = router;
