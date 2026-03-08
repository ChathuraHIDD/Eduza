const router = require("express").Router();
const { createEvent, getEvents } = require("../controllers/calendarController");

router.post("/", createEvent);
router.get("/", getEvents);

module.exports = router;
