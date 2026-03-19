const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { body, param, validationResult } = require("express-validator");

const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Too many accounts created, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    console.log("Validation errors:", errors.array());
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  };
};

const authValidations = {
  login: [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 1 }).withMessage("Password is required"),
  ],
  register: [
    body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2-50 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6, max: 100 }).withMessage("Password must be 6-100 characters"),
  ],
};

const taskValidations = {
  create: [
    body("title").trim().isLength({ min: 1, max: 200 }).withMessage("Title is required (max 200 chars)"),
    body("projectId").optional().isString().matches(/^[a-zA-Z0-9\-_]+$/).withMessage("Invalid project ID"),
    body("status").optional().isIn(["todo", "in_progress", "done"]).withMessage("Invalid status"),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
  ],
  update: [
    param("id").matches(/^[a-zA-Z0-9\-_]+$/).withMessage("Invalid task ID"),
    body("title").optional().trim().isLength({ min: 1, max: 200 }).withMessage("Title max 200 chars"),
    body("status").optional().isIn(["todo", "in_progress", "done"]).withMessage("Invalid status"),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
  ],
};

const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };
};

module.exports = {
  securityMiddleware,
  rateLimiter,
  authRateLimiter,
  registerRateLimiter,
  validate,
  validateRequest,
  authValidations,
  taskValidations,
};
