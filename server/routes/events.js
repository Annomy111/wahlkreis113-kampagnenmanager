const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  registerForEvent,
  addEventFeedback
} = require('../controllers/eventController');

router.route('/')
  .post(protect, authorize('admin'), createEvent)
  .get(protect, getEvents);

router.route('/:id')
  .get(protect, getEvent)
  .put(protect, authorize('admin'), updateEvent);

router.post('/:id/register', protect, registerForEvent);
router.post('/:id/feedback', protect, addEventFeedback);

module.exports = router;
