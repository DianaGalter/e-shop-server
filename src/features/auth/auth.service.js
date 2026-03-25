const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../users/users.model");
const {
  sendVerificationEmail,
  sendResetPasswordEmail,
  send2FACode,
} = require("../../services/email.service");

const generateToken = () => crypto.randomBytes(32).toString("hex");

const signJWT = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const register = async (userData) => {
  const existing = await User.findOne({ email: userData.email });
  if (existing)
    throw Object.assign(new Error("Email already registered"), {
      statusCode: 409,
    });

  const verificationToken = generateToken();
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await User.create({
    ...userData,
    verificationToken,
    verificationTokenExpiry,
    isVerified: false,
  });

  await sendVerificationEmail(user.email, verificationToken, user.name);
  const token = signJWT(user._id, user.role);
  return { user: user.toJSON(), token };
};

const login = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user)
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const valid = await user.comparePassword(password);
  if (!valid)
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  if (!user.isVerified)
    throw Object.assign(new Error("Please verify your email first"), {
      statusCode: 403,
    });

  const token = signJWT(user._id, user.role);
  const userObj = user.toJSON();
  delete userObj.password;
  return { user: userObj, token };
};

const verifyEmail = async (token) => {
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: new Date() },
  });
  if (!user)
    throw Object.assign(new Error("Invalid or expired token"), {
      statusCode: 400,
    });

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();
  return { message: "Email verified successfully" };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return { message: "If email exists, reset link will be sent" };

  const resetToken = generateToken();
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  await sendResetPasswordEmail(user.email, resetToken);
  return { message: "If email exists, reset link will be sent" };
};

const resetPassword = async (token, password) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: new Date() },
  }).select("+password");
  if (!user)
    throw Object.assign(new Error("Invalid or expired token"), {
      statusCode: 400,
    });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();
  return { message: "Password reset successfully" };
};

const adminLogin = async (email, password) => {
  const user = await User.findOne({ email, role: "admin" }).select("+password");
  if (!user)
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const valid = await user.comparePassword(password);
  if (!valid)
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const code = crypto.randomInt(100000, 999999).toString();
  user.twoFactorCode = code;
  user.twoFactorExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await send2FACode(user.email, code);
  return { message: "2FA code sent to email", email: user.email };
};

const verify2FA = async (email, code) => {
  const user = await User.findOne({ email, role: "admin" }).select(
    "+twoFactorCode +twoFactorExpiry",
  );
  if (!user)
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
  if (user.twoFactorCode !== code)
    throw Object.assign(new Error("Invalid 2FA code"), { statusCode: 401 });
  if (user.twoFactorExpiry < new Date())
    throw Object.assign(new Error("2FA code expired"), { statusCode: 401 });

  user.twoFactorCode = undefined;
  user.twoFactorExpiry = undefined;
  await user.save();

  const token = signJWT(user._id, user.role);
  const userObj = (await User.findById(user._id)).toJSON();
  return { user: userObj, token };
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  adminLogin,
  verify2FA,
};
