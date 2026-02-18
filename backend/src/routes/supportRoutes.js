const router = require("express").Router();
const { createTicket, getTickets, updateTicketStatus } = require("../controllers/supportController");

router.post("/", createTicket);
router.get("/", getTickets);
router.patch("/:id/status", updateTicketStatus);

module.exports = router;
