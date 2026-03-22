const Joi = require("joi");

const objectIdSchema = Joi.string().length(24).hex();

const validateObjectId = (value) => {
  const { error } = objectIdSchema.validate(value);
  return !error;
};

module.exports = { objectIdSchema, validateObjectId };
