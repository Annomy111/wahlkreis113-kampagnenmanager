const Event = require('../models/Event');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      organizer: req.user.id
    });

    // Create a chat room for the event
    await ChatRoom.create({
      name: `Event: ${event.title}`,
      type: 'event',
      participants: [req.user.id],
      admins: [req.user.id],
      event: event._id,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
exports.getEvents = async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;
    const filter = {};

    // Add filters if they exist
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    const events = await Event.find(filter)
      .populate('organizer', 'firstName lastName email')
      .populate('participants.user', 'firstName lastName')
      .populate('district', 'name code')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email')
      .populate('participants.user', 'firstName lastName')
      .populate('district', 'name code')
      .populate('feedback.user', 'firstName lastName');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Veranstaltung nicht gefunden'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Veranstaltung nicht gefunden'
      });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung zum Bearbeiten dieser Veranstaltung'
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Veranstaltung nicht gefunden'
      });
    }

    // Check if event is full
    if (event.isFull()) {
      return res.status(400).json({
        success: false,
        message: 'Veranstaltung ist bereits ausgebucht'
      });
    }

    // Check if user is already registered
    if (event.participants.some(p => p.user.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Sie sind bereits für diese Veranstaltung registriert'
      });
    }

    event.participants.push({
      user: req.user.id,
      status: 'registered'
    });

    // Add user to event chat room
    const chatRoom = await ChatRoom.findOne({ event: event._id });
    if (chatRoom) {
      chatRoom.addParticipant(req.user.id);
      await chatRoom.save();
    }

    await event.save();

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Add event feedback
// @route   POST /api/events/:id/feedback
// @access  Private
exports.addEventFeedback = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Veranstaltung nicht gefunden'
      });
    }

    // Check if user participated in event
    const participated = event.participants.some(
      p => p.user.toString() === req.user.id && p.status === 'attended'
    );

    if (!participated) {
      return res.status(403).json({
        success: false,
        message: 'Sie können nur Feedback zu Veranstaltungen geben, an denen Sie teilgenommen haben'
      });
    }

    // Check if user already gave feedback
    if (event.feedback.some(f => f.user.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Sie haben bereits Feedback zu dieser Veranstaltung gegeben'
      });
    }

    const feedback = {
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment
    };

    event.feedback.push(feedback);
    await event.save();

    // Award points for giving feedback
    const user = await User.findById(req.user.id);
    user.points += 5;
    await user.save();

    res.json({
      success: true,
      data: event.feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
