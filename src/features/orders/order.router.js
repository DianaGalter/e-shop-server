const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { validate } = require("../../shared/middleware/validate.middleware");
const authenticate = require("../../shared/middleware/authenticate.middleware");
const authorize = require("../../shared/middleware/authorize.middleware");
const {
  createOrderSchema,
  updateOrderStatusSchema,
} = require("./order.schemas");

router.post(
  "/",
  authenticate,
  authorize("customer", "admin"),
  validate(createOrderSchema),
  orderController.create,
);
router.get(
  "/my-orders",
  authenticate,
  authorize("customer", "admin"),
  orderController.getMyOrders,
);
router.get("/", authenticate, authorize("admin"), orderController.getAll);
router.get("/:id", authenticate, orderController.getById);
router.put(
  "/:id/status",
  authenticate,
  authorize("admin"),
  validate(updateOrderStatusSchema),
  orderController.updateStatus,
);
router.put(
  "/:id/cancel",
  authenticate,
  authorize("customer", "admin"),
  orderController.cancel,
);

module.exports = router;
