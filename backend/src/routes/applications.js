import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Application from '../models/Application.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @route   POST /api/applications
// @desc    Create a new application
// @access  Private
router.post('/', [
  body('universityName')
    .trim()
    .notEmpty()
    .withMessage('University name is required'),
  body('degree')
    .trim()
    .notEmpty()
    .withMessage('Degree is required'),
  body('priority')
    .isIn(['High', 'Medium', 'Low'])
    .withMessage('Priority must be High, Medium, or Low'),
  body('numberOfSemesters')
    .isInt({ min: 1, max: 20 })
    .withMessage('Number of semesters must be between 1 and 20'),
  body('applicationPortal')
    .isURL()
    .withMessage('Application portal must be a valid URL'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('startingSemester')
    .trim()
    .notEmpty()
    .withMessage('Starting semester is required'),
  body('tuitionFees')
    .isFloat({ min: 0 })
    .withMessage('Tuition fees must be a positive number'),
  body('livingExpenses')
    .isFloat({ min: 0 })
    .withMessage('Living expenses must be a positive number'),
  body('deadline')
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  body('status')
    .optional()
    .isIn(['Draft', 'In Progress', 'Submitted', 'Accepted', 'Rejected'])
    .withMessage('Status must be Draft, In Progress, Submitted, Accepted, or Rejected')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      console.log('Request body:', req.body);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const application = await Application.create({
      ...req.body,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/applications
// @desc    Get all applications with filtering and sorting
// @access  Private
router.get('/', [
  query('priority')
    .optional()
    .isIn(['High', 'Medium', 'Low'])
    .withMessage('Priority must be High, Medium, or Low'),
  query('status')
    .optional()
    .isIn(['Draft', 'In Progress', 'Submitted', 'Accepted', 'Rejected'])
    .withMessage('Status must be Draft, In Progress, Submitted, Accepted, or Rejected'),
  query('country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country cannot be empty'),
  query('startingSemester')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Starting semester cannot be empty'),
  query('sortBy')
    .optional()
    .isIn(['deadline', 'priority', 'tuitionFees', 'livingExpenses', 'createdAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const {
      priority,
      status,
      country,
      startingSemester,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Get applications with filters
    const applications = await Application.findByUserId(req.user._id, {
      priority,
      status,
      country,
      startingSemester,
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      count: applications.length,
      data: { applications }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const application = await Application.findByIdAndUserId(req.params.id, req.user._id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/applications/:id
// @desc    Update application
// @access  Private
router.put('/:id', [
  body('universityName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('University name cannot be empty'),
  body('degree')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Degree cannot be empty'),
  body('priority')
    .optional()
    .isIn(['High', 'Medium', 'Low'])
    .withMessage('Priority must be High, Medium, or Low'),
  body('numberOfSemesters')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Number of semesters must be between 1 and 20'),
  body('applicationPortal')
    .optional()
    .isURL()
    .withMessage('Application portal must be a valid URL'),
  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty'),
  body('country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country cannot be empty'),
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty'),
  body('startingSemester')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Starting semester cannot be empty'),
  body('tuitionFees')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tuition fees must be a positive number'),
  body('livingExpenses')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Living expenses must be a positive number'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  body('status')
    .optional()
    .isIn(['Draft', 'In Progress', 'Submitted', 'Accepted', 'Rejected'])
    .withMessage('Status must be Draft, In Progress, Submitted, Accepted, or Rejected')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    let application = await Application.findByIdAndUserId(req.params.id, req.user._id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update application
    application = await Application.findByIdAndUpdate(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Delete application
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const application = await Application.findByIdAndUserId(req.params.id, req.user._id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
