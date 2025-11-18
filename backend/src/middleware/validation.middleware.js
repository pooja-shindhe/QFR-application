const { body, param, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User Registration Validation
const validateRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['customer', 'vendor'])
    .withMessage('Role must be either customer or vendor'),
  
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Company name must be between 2 and 200 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// User Login Validation
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// RFQ Creation Validation
const validateRFQCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required'),
  
  body('deliveryLocation')
    .trim()
    .notEmpty()
    .withMessage('Delivery location is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Delivery location must be between 5 and 500 characters'),
  
  body('deliveryDate')
    .notEmpty()
    .withMessage('Delivery date is required')
    .isISO8601()
    .withMessage('Invalid delivery date format')
    .custom((value) => {
      const deliveryDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deliveryDate < today) {
        throw new Error('Delivery date must be in the future');
      }
      return true;
    }),
  
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (endDate < today) {
        throw new Error('End date must be in the future');
      }
      
      if (req.body.deliveryDate) {
        const deliveryDate = new Date(req.body.deliveryDate);
        if (endDate >= deliveryDate) {
          throw new Error('Bidding end date must be before delivery date');
        }
      }
      
      return true;
    }),
  
  body('estimatedBudget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated budget must be a positive number'),
  
  handleValidationErrors
];

// RFQ Update Validation
const validateRFQUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('deliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid delivery date format'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  
  handleValidationErrors
];

// Bid Creation Validation
const validateBidCreation = [
  body('rfqId')
    .notEmpty()
    .withMessage('RFQ ID is required')
    .isMongoId()
    .withMessage('Invalid RFQ ID format'),
  
  body('quotedPrice')
    .notEmpty()
    .withMessage('Quoted price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Quoted price must be greater than 0'),
  
  body('deliveryTime')
    .notEmpty()
    .withMessage('Delivery time is required')
    .isInt({ min: 1 })
    .withMessage('Delivery time must be a positive integer'),
  
  body('deliveryTimeUnit')
    .notEmpty()
    .withMessage('Delivery time unit is required')
    .isIn(['days', 'weeks', 'months'])
    .withMessage('Delivery time unit must be days, weeks, or months'),
  
  body('validityPeriod')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Validity period must be a positive integer'),
  
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comments must not exceed 1000 characters'),
  
  handleValidationErrors
];

// Bid Update Validation
const validateBidUpdate = [
  body('quotedPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Quoted price must be greater than 0'),
  
  body('deliveryTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Delivery time must be a positive integer'),
  
  body('deliveryTimeUnit')
    .optional()
    .isIn(['days', 'weeks', 'months'])
    .withMessage('Delivery time unit must be days, weeks, or months'),
  
  handleValidationErrors
];

// Contract Creation Validation
const validateContractCreation = [
  body('rfqId')
    .notEmpty()
    .withMessage('RFQ ID is required')
    .isMongoId()
    .withMessage('Invalid RFQ ID format'),
  
  body('bidId')
    .notEmpty()
    .withMessage('Bid ID is required')
    .isMongoId()
    .withMessage('Invalid Bid ID format'),
  
  body('contractValue')
    .notEmpty()
    .withMessage('Contract value is required')
    .isFloat({ min: 0.01 })
    .withMessage('Contract value must be greater than 0'),
  
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (req.body.startDate) {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  body('terms')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Terms must not exceed 5000 characters'),
  
  body('paymentTerms')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Payment terms must not exceed 1000 characters'),
  
  body('deliveryTerms')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Delivery terms must not exceed 1000 characters'),
  
  handleValidationErrors
];

// MongoDB ID Validation
const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  
  handleValidationErrors
];

// Status Validation
const validateStatus = (allowedStatuses) => [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(allowedStatuses)
    .withMessage(`Status must be one of: ${allowedStatuses.join(', ')}`),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateRFQCreation,
  validateRFQUpdate,
  validateBidCreation,
  validateBidUpdate,
  validateContractCreation,
  validateMongoId,
  validateStatus
};
