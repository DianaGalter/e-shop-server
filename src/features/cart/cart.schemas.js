const Joi = require("joi");

const addToCartSchema = Joi.object({
  productId: Joi.string().length(24).hex().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const syncCartSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().length(24).hex().required(),
        quantity: Joi.number().integer().min(1).required(),
      }),
    )
    .required(),
});

module.exports = { addToCartSchema, syncCartSchema };
