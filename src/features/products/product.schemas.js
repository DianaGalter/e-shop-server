const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).trim().required(),
  description: Joi.string().min(10).max(2000).required(),
  price: Joi.number().positive().precision(2).required(),
  category: Joi.string()
    .valid("electronics", "clothing", "food", "books", "other")
    .required(),
  stock: Joi.number().integer().min(0).required(),
  images: Joi.array().items(Joi.string()).optional(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).trim(),
  description: Joi.string().min(10).max(2000),
  price: Joi.number().positive().precision(2),
  category: Joi.string().valid(
    "electronics",
    "clothing",
    "food",
    "books",
    "other",
  ),
  stock: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  images: Joi.array().items(Joi.string()),
}).min(1);

const ratingSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(500).optional(),
});

module.exports = { createProductSchema, updateProductSchema, ratingSchema };
