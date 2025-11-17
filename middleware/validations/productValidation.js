// middlewares/validateProduct.js
const { body, validationResult } = require("express-validator");
const {handleValidationErrors} = require("../validation.js");
const {idParamValidator} = require('./idValidation');

const validateImages = (req, res, next) => {
  if (req.files && req.files.length > 5) {
    return res.status(400).json({ errors: [{ msg: "Max 5 images are allowed", param: "images" }] });
  }

  if (req.files) {
    for (const f of req.files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.mimetype)) {
        return res.status(400).json({ errors: [{ msg: "Only JPEG, PNG, WEBP images allowed", param: "images" }] });
      }
      if (f.size > 10 * 1024 * 1024) {
        return res.status(400).json({ errors: [{ msg: "Each image must be <= 10MB", param: "images" }] });
      }
    }
  }
  next();
};

const validateProduct = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3, max: 100 }).withMessage("Name must be 3–100 characters long"),
  
  body("description")
    .optional()
    .trim()
    .escape(),

  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("categories")
    .optional()
    .customSanitizer(value => {
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return value.split(",").map(v => v.trim());
        }
        }
        return value;
    })
    .isArray().withMessage("Categories must be an array of strings"),

  body("tags")
    .optional()
    .customSanitizer(value => {
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return value.split(",").map(v => v.trim());
        }
        }
        return value;
    })
    .isArray().withMessage("Tags must be an array of strings"),

  body("categories.*")
    .optional()
    .trim()
    .escape()
    .isString()
    .withMessage("Each category must be a string"),

  body("tags.*")
    .optional()
    .trim()
    .escape()
    .isString()
    .withMessage("Each tag must be a string"),


  body("stockQuantity")
    .optional()
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),

  body("brand")
    .optional()
    .trim()
    .escape(),

  body("length.value")
    .optional()
    .isFloat({ min: 0 }).withMessage("Length value must be a positive number"),

  body("length.unit")
    .optional()
    .isIn(["inches", "meters", "feet"]).withMessage("Unit must be inches, meters, or feet")
    .trim()
    .escape(),

  body("color")
    .optional()
    .trim()
    .escape(),

  validateImages,

  // middleware to handle results
  handleValidationErrors
];

const validateStock = [
    ...idParamValidator,
  body("quantity").isInt({ min: 0 }).withMessage("Quantity must be >= 0"),
  handleValidationErrors
];

const validatePopularity = [
    ...idParamValidator,
  body("popularity").isInt({ min: 0 }).withMessage("Popularity must be >= 0"),
  handleValidationErrors
];

module.exports = {
    validateProduct,
    validateStock,
    validatePopularity,
    validateImages, 
};
