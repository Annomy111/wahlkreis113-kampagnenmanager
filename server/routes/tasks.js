const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment
} = require('../controllers/taskController');

router.route('/')
  .post(protect, authorize('admin'), createTask)
  .get(protect, getTasks);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, authorize('admin'), deleteTask);

router.post('/:id/comments', protect, addComment);

module.exports = router;
