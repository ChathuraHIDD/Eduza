const express = require('express');
const { getFeedback, createFeedback } = require('../controllers/feedbackController');

const router = express.Router();

router.route('/').get(getFeedback).post(createFeedback);

module.exports = router;
