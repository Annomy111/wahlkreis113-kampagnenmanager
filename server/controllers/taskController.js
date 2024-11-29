const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private/Admin
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { type, status, priority } = req.query;
    const filter = {};

    // Add filters if they exist
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // If user is not admin, only show assigned tasks
    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user.id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('district', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('district', 'name code')
      .populate('comments.user', 'firstName lastName');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Aufgabe nicht gefunden'
      });
    }

    // Check if user has access to task
    if (req.user.role !== 'admin' && 
        !task.assignedTo.some(user => user._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung für diese Aufgabe'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Aufgabe nicht gefunden'
      });
    }

    // Check ownership or admin status
    if (task.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung zum Bearbeiten dieser Aufgabe'
      });
    }

    // If task is being marked as completed
    if (req.body.status === 'completed' && task.status !== 'completed') {
      // Award points to assigned users
      const assignedUsers = await User.find({ _id: { $in: task.assignedTo } });
      for (let user of assignedUsers) {
        user.points += task.points;
        user.completedTasks.push(task._id);
        await user.save();
      }
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Aufgabe nicht gefunden'
      });
    }

    await task.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Aufgabe nicht gefunden'
      });
    }

    const comment = {
      user: req.user.id,
      text: req.body.text
    };

    task.comments.unshift(comment);
    await task.save();

    res.json({
      success: true,
      data: task.comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
