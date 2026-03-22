const Joi = require("joi");

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain uppercase, lowercase and number",
  });

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email({ tlds: false }).lowercase().required(),
  password: passwordSchema,
});

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).lowercase().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).lowercase().required(),
});

const resetPasswordSchema = Joi.object({
  password: passwordSchema,
});

const verify2faSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).lowercase().required(),
  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verify2faSchema,
};
