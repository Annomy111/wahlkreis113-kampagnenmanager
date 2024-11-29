const District = require('../models/District');
const User = require('../models/User');

// @desc    Create new district
// @route   POST /api/districts
// @access  Private/Admin
exports.createDistrict = async (req, res) => {
  try {
    const district = await District.create(req.body);

    res.status(201).json({
      success: true,
      data: district
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all districts
// @route   GET /api/districts
// @access  Private
exports.getDistricts = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};

    // Add filters if they exist
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // If user is not admin, only show assigned districts
    if (req.user.role !== 'admin') {
      filter.assignedVolunteers = req.user.id;
    }

    const districts = await District.find(filter)
      .populate('assignedVolunteers', 'firstName lastName email')
      .sort({ priority: -1, name: 1 });

    res.json({
      success: true,
      count: districts.length,
      data: districts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single district
// @route   GET /api/districts/:id
// @access  Private
exports.getDistrict = async (req, res) => {
  try {
    const district = await District.findById(req.params.id)
      .populate('assignedVolunteers', 'firstName lastName email')
      .populate('visitedHouseholds.volunteer', 'firstName lastName');

    if (!district) {
      return res.status(404).json({
        success: false,
        message: 'Distrikt nicht gefunden'
      });
    }

    // Check if user has access to district
    if (req.user.role !== 'admin' && 
        !district.assignedVolunteers.some(vol => vol._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung für diesen Distrikt'
      });
    }

    res.json({
      success: true,
      data: district
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update district
// @route   PUT /api/districts/:id
// @access  Private/Admin
exports.updateDistrict = async (req, res) => {
  try {
    let district = await District.findById(req.params.id);

    if (!district) {
      return res.status(404).json({
        success: false,
        message: 'Distrikt nicht gefunden'
      });
    }

    district = await District.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: district
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Add visited household
// @route   POST /api/districts/:id/households
// @access  Private
exports.addVisitedHousehold = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);

    if (!district) {
      return res.status(404).json({
        success: false,
        message: 'Distrikt nicht gefunden'
      });
    }

    // Check if user is assigned to district
    if (req.user.role !== 'admin' && 
        !district.assignedVolunteers.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung für diesen Distrikt'
      });
    }

    const household = {
      ...req.body,
      volunteer: req.user.id,
      visitDate: Date.now()
    };

    district.visitedHouseholds.push(household);
    district.updateStatistics();
    await district.save();

    // Update user points
    const user = await User.findById(req.user.id);
    user.points += 5; // Points for visiting a household
    await user.save();

    res.json({
      success: true,
      data: district
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get district statistics
// @route   GET /api/districts/:id/statistics
// @access  Private
exports.getDistrictStatistics = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);

    if (!district) {
      return res.status(404).json({
        success: false,
        message: 'Distrikt nicht gefunden'
      });
    }

    const statistics = {
      totalHouseholds: district.statistics.totalHouseholds,
      visitedHouseholds: district.statistics.visitedHouseholds,
      positiveResponses: district.statistics.positiveResponses,
      followUpNeeded: district.statistics.followUpNeeded,
      completionRate: (district.statistics.visitedHouseholds / district.statistics.totalHouseholds) * 100,
      positiveRate: (district.statistics.positiveResponses / district.statistics.visitedHouseholds) * 100
    };

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
