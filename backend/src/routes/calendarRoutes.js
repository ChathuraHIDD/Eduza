const express = require('express');
const { getEvents, createEvent, deleteEvent } = require('../controllers/calendarController');

const router = express.Router();

router.route('/').get(getEvents).post(createEvent);
router.route('/:id').delete(deleteEvent);

module.exports = router;
