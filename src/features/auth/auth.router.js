const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { validate } = require("../../shared/middleware/validate.middleware");
const authenticate = require("../../shared/middleware/authenticate.middleware");
const {
  authLimiter,
} = require("../../shared/middleware/rateLimiter.middleware");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verify2faSchema,
} = require("./auth.schemas");

router.use("/login", authLimiter);
router.use("/admin/login", authLimiter);

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/verify-email/:token", authController.verifyEmail);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  authController.resetPassword,
);
router.post("/admin/login", validate(loginSchema), authController.adminLogin);
router.post(
  "/admin/verify-2fa",
  validate(verify2faSchema),
  authController.verify2FA,
);

router.post("/logout", authenticate, (req, res) =>
  res.json({ success: true, message: "Logged out" }),
);
router.get("/me", authenticate, authController.getMe);

module.exports = router;
