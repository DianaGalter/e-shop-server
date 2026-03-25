const express = require("express");
const router = express.Router();
const productController = require("./products.controller");
const { validate } = require("../../shared/middleware/validate.middleware");
const authenticate = require("../../shared/middleware/authenticate.middleware");
const authorize = require("../../shared/middleware/authorize.middleware");
const upload = require("../../config/multer.config");
const {
  createProductSchema,
  updateProductSchema,
  ratingSchema,
} = require("./product.schemas");

router.get("/", productController.getAll);
router.get("/category/:cat", productController.getByCategory);
router.get("/:id", productController.getById);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.array("images", 5),
  validate(createProductSchema),
  productController.create,
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  upload.array("images", 5),
  validate(updateProductSchema),
  productController.update,
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  productController.remove,
);

router.post(
  "/:id/rating",
  authenticate,
  authorize("customer"),
  validate(ratingSchema),
  productController.addRating,
);

module.exports = router;
