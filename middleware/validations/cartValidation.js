const {handleValidationErrors} = require('../validation');
const { body} = require('express-validator'); 

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);


const addItemSchema = [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    handleValidationErrors
];

const removeItemSchema = [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    handleValidationErrors
];

const updateQuantitySchema = [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    handleValidationErrors
];

module.exports = {
    addItemSchema,
    removeItemSchema,
    updateQuantitySchema
};
