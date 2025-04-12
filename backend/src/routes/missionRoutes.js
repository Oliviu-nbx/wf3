const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createMission,
  getMissions,
  getMissionById,
  updateMission,
  applyToMission,
  respondToApplication,
  addMissionTask,
  updateTaskStatus
} = require('../controllers/missionController');

// All routes are protected
router.use(protect);

// Mission routes
router.route('/')
  .post(createMission)
  .get(getMissions);

router.route('/:id')
  .get(getMissionById)
  .put(updateMission);

// Application routes
router.post('/:id/apply', applyToMission);
router.put('/:id/applications/:applicationId', respondToApplication);

// Task routes
router.post('/:id/tasks', addMissionTask);
router.put('/:id/tasks/:taskId', updateTaskStatus);

module.exports = router;
