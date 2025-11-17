const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validation rules for user registration
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .matches(/^(\+234|0)[789][01]\d{8}$/)
    .withMessage('Please provide a valid Nigerian phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Validation rules for password reset
const validatePasswordReset = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body().custom((value, { req }) => {
    if (!req.body.email) {
      throw new Error('Email must be provided');
    }
    return true;
  }),

  handleValidationErrors
];

// Validation rules for password change
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .trim()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .trim()
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .notEmpty()
    .isLength({ min: 6, max: 128 })
    .trim()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validation rules for profile update
const validateProfileUpdate = [
  body('phone')
    .optional()
    .matches(/^(\+234|0)[789][01]\d{8}$/)
    .withMessage('Please provide a valid Nigerian phone number'),
  
  handleValidationErrors
];



// Validation rules for pagination
// const validatePagination = [
//   query('page')
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage('Page must be a positive integer'),
  
//   query('limit')
//     .optional()
//     .isInt({ min: 1, max: 100 })
//     .withMessage('Limit must be between 1 and 100'),
  
//   query('status')
//     .optional()
//     .isIn(['pending', 'processing', 'successful', 'failed', 'cancelled'])
//     .withMessage('Invalid status filter'),
  
//   query('type')
//     .optional()
//     .isIn(['airtime', 'data', 'cable_tv', 'electricity', 'wallet_funding', 'wallet_withdrawal'])
//     .withMessage('Invalid transaction type'),
  
//   handleValidationErrors
// ];

// Validation rules for date range
// const validateDateRange = [
//   query('startDate')
//     .optional()
//     .isISO8601()
//     .withMessage('Start date must be a valid ISO date'),
  
//   query('endDate')
//     .optional()
//     .isISO8601()
//     .withMessage('End date must be a valid ISO date')
//     .custom((value, { req }) => {
//       if (req.query.startDate && new Date(value) < new Date(req.query.startDate)) {
//         throw new Error('End date must be after start date');
//       }
//       return true;
//     }),
  
//   handleValidationErrors
// ];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validatePasswordChange,
  validateProfileUpdate,
  // validateTransactionId,
  // validatePagination,
  // validateDateRange
}; 