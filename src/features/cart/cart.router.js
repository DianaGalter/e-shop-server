const express = require("express");
const router = express.Router();
const cartController = require("./cart.controller");
const { validate } = require("../../shared/middleware/validate.middleware");
const authenticate = require("../../shared/middleware/authenticate.middleware");
const authorize = require("../../shared/middleware/authorize.middleware");
const { addToCartSchema, syncCartSchema } = require("./cart.schemas");

router.get(
  "/",
  authenticate,
  authorize("customer", "admin"),
  cartController.getCart,
);
router.post(
  "/",
  authenticate,
  authorize("customer", "admin"),
  validate(addToCartSchema),
  cartController.addToCart,
);
router.put(
  "/:productId",
  authenticate,
  authorize("customer", "admin"),
  cartController.updateQuantity,
);
router.delete(
  "/:productId",
  authenticate,
  authorize("customer", "admin"),
  cartController.removeFromCart,
);
router.delete(
  "/",
  authenticate,
  authorize("customer", "admin"),
  cartController.clearCart,
);
router.post(
  "/sync",
  authenticate,
  authorize("customer", "admin"),
  validate(syncCartSchema),
  cartController.syncCart,
);

module.exports = router;
