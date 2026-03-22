const User = require("./user.model");

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user;
};

const updateProfile = async (userId, data) => {
  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const valid = await user.comparePassword(currentPassword);
  if (!valid)
    throw Object.assign(new Error("Current password is incorrect"), {
      statusCode: 400,
    });

  user.password = newPassword;
  await user.save();
  return { message: "Password updated" };
};

const addAddress = async (userId, address) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $push: { addresses: address } },
    { new: true },
  );
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user;
};

const updateAddress = async (userId, addrId, address) => {
  const user = await User.findById(userId);
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const addr = user.addresses.id(addrId);
  if (!addr)
    throw Object.assign(new Error("Address not found"), { statusCode: 404 });

  Object.assign(addr, address);
  await user.save();
  return user;
};

const deleteAddress = async (userId, addrId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { addresses: { _id: addrId } } },
    { new: true },
  );
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user;
};

const getAllUsers = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().select("-password").skip(skip).limit(limit).lean(),
    User.countDocuments(),
  ]);
  return {
    data: users,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalCount: total,
  };
};

const updateRole = async (userId, role) => {
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user;
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
  updateRole,
  deleteUser,
};
