const Mission = require('../models/Mission');
const User = require('../models/User');

// @desc    Create a new mission
// @route   POST /api/missions
// @access  Private
const createMission = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      requiredSkills,
      budget,
      potentialReturns,
      location,
      startDate,
      endDate,
      visibility
    } = req.body;

    // Create mission
    const mission = await Mission.create({
      creator: req.user._id,
      title,
      description,
      category,
      requiredSkills,
      budget,
      potentialReturns,
      location,
      startDate,
      endDate,
      visibility,
      team: [{ user: req.user._id, role: 'Creator', status: 'active', joinedAt: Date.now() }]
    });

    if (mission) {
      res.status(201).json({
        success: true,
        mission
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid mission data'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all missions
// @route   GET /api/missions
// @access  Private
const getMissions = async (req, res) => {
  try {
    const { 
      category, 
      skills, 
      status = 'open', 
      page = 1, 
      limit = 10,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;
    
    // Build query
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (skills) {
      query.requiredSkills = { $in: skills.split(',') };
    }
    
    if (status) {
      query.status = status;
    }
    
    // Only show public missions or missions where user is a team member
    query.$or = [
      { visibility: 'public' },
      { 'team.user': req.user._id }
    ];
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    // Execute query
    const missions = await Mission.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creator', 'name profileImage')
      .populate('team.user', 'name profileImage');
    
    // Get total count
    const total = await Mission.countDocuments(query);
    
    res.json({
      success: true,
      count: missions.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      page: parseInt(page),
      missions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get mission by ID
// @route   GET /api/missions/:id
// @access  Private
const getMissionById = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('creator', 'name profileImage')
      .populate('team.user', 'name profileImage skills')
      .populate('tasks.assignedTo', 'name profileImage')
      .populate('applications.user', 'name profileImage skills');
    
    if (mission) {
      // Check if mission is public or user is a team member
      const isTeamMember = mission.team.some(member => 
        member.user._id.toString() === req.user._id.toString()
      );
      
      if (mission.visibility === 'public' || isTeamMember) {
        // Increment view count
        mission.views += 1;
        await mission.save();
        
        res.json({
          success: true,
          mission
        });
      } else {
        res.status(403).json({
          success: false,
          error: 'Not authorized to view this mission'
        });
      }
    } else {
      res.status(404).json({
        success: false,
        error: 'Mission not found'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update mission
// @route   PUT /api/missions/:id
// @access  Private
const updateMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found'
      });
    }
    
    // Check if user is the creator
    if (mission.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this mission'
      });
    }
    
    // Update fields
    const updatedFields = req.body;
    
    // Don't allow updating creator or team directly
    delete updatedFields.creator;
    delete updatedFields.team;
    
    const updatedMission = await Mission.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    )
      .populate('creator', 'name profileImage')
      .populate('team.user', 'name profileImage skills');
    
    res.json({
      success: true,
      mission: updatedMission
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Apply to mission
// @route   POST /api/missions/:id/apply
// @access  Private
const applyToMission = async (req, res) => {
  try {
    const { message } = req.body;
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found'
      });
    }
    
    // Check if mission is open
    if (mission.status !== 'open') {
      return res.status(400).json({
        success: false,
        error: 'This mission is not accepting applications'
      });
    }
    
    // Check if user already applied
    const alreadyApplied = mission.applications.some(
      app => app.user.toString() === req.user._id.toString()
    );
    
    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied to this mission'
      });
    }
    
    // Check if user is already a team member
    const isTeamMember = mission.team.some(
      member => member.user.toString() === req.user._id.toString()
    );
    
    if (isTeamMember) {
      return res.status(400).json({
        success: false,
        error: 'You are already a team member of this mission'
      });
    }
    
    // Add application
    mission.applications.push({
      user: req.user._id,
      message,
      status: 'pending',
      appliedAt: Date.now()
    });
    
    await mission.save();
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Respond to mission application
// @route   PUT /api/missions/:id/applications/:applicationId
// @access  Private
const respondToApplication = async (req, res) => {
  try {
    const { status } = req.body;
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found'
      });
    }
    
    // Check if user is the creator
    if (mission.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to respond to applications'
      });
    }
    
    // Find application
    const application = mission.applications.id(req.params.applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    // Update application status
    application.status = status;
    application.respondedAt = Date.now();
    
    // If accepted, add to team
    if (status === 'accepted') {
      mission.team.push({
        user: application.user,
        role: 'Member',
        status: 'active',
        joinedAt: Date.now()
      });
    }
    
    await mission.save();
    
    res.json({
      success: true,
      message: `Application ${status}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Add task to mission
// @route   POST /api/missions/:id/tasks
// @access  Private
const addMissionTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found'
      });
    }
    
    // Check if user is a team member
    const isTeamMember = mission.team.some(
      member => member.user.toString() === req.user._id.toString() && member.status === 'active'
    );
    
    if (!isTeamMember) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add tasks to this mission'
      });
    }
    
    // Add task
    mission.tasks.push({
      title,
      description,
      assignedTo,
      dueDate,
      status: 'pending'
    });
    
    await mission.save();
    
    res.status(201).json({
      success: true,
      task: mission.tasks[mission.tasks.length - 1]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update task status
// @route   PUT /api/missions/:id/tasks/:taskId
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({
        success: false,
        error: 'Mission not found'
      });
    }
    
    // Check if user is a team member
    const isTeamMember = mission.team.some(
      member => member.user.toString() === req.user._id.toString() && member.status === 'active'
    );
    
    if (!isTeamMember) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update tasks in this mission'
      });
    }
    
    // Find task
    const task = mission.tasks.id(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // Update task status
    task.status = status;
    
    // If completed, set completedAt
    if (status === 'completed') {
      task.completedAt = Date.now();
    } else {
      task.completedAt = undefined;
    }
    
    await mission.save();
    
    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  createMission,
  getMissions,
  getMissionById,
  updateMission,
  applyToMission,
  respondToApplication,
  addMissionTask,
  updateTaskStatus
};
