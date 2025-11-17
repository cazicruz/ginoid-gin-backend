// utils/validators.js
const { param, body } = require("express-validator");
const mongoose = require("mongoose");
const {handleValidationErrors} = require('../validation')

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const idParamValidator = [
  param("id")
    .custom((value) => isValidObjectId(value))
    .withMessage("Invalid Object ID format"),
    handleValidationErrors
];

const bulkIdsValidator = [
  body("productIds")
    .isArray({ min: 1 })
    .withMessage("productIds must be a non-empty array"),
  body("productIds.*")
    .custom((value) => isValidObjectId(value))
    .withMessage("Each Id must be a valid MongoDB ObjectId"),
    handleValidationErrors
];

module.exports = {
  idParamValidator,
  bulkIdsValidator,
};
