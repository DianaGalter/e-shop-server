const Joi = require("joi");
import { addressSchema } from "../users/users.schemas";

const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().length(24).hex().required(),
        quantity: Joi.number().integer().min(1).required(),
      }),
    )
    .min(1)
    .required(),
  shippingAddress: addressSchema.required(),
  paymentMethod: Joi.string().valid("credit", "paypal", "simulated").required(),
  notes: Joi.string().optional(),
});

const updateOrderStatusSchema = Joi.object({
  orderStatus: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .required(),
  trackingNumber: Joi.string().optional(),
});

module.exports = { createOrderSchema, updateOrderStatusSchema };
