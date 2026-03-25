const User = require("../users/users.model");
const Product = require("../products/product.model");

const getCart = async (userId) => {
  const user = await User.findById(userId).populate(
    "cart.product",
    "name price images stock",
  );
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user.cart;
};

const addToCart = async (userId, productId, quantity) => {
  const user = await User.findById(userId);
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const product = await Product.findById(productId).where("isActive", true);
  if (!product)
    throw Object.assign(new Error("Product not found"), { statusCode: 404 });
  if (product.stock < quantity)
    throw Object.assign(new Error("Insufficient stock"), { statusCode: 400 });

  const existing = user.cart.find(
    (cart) => cart.product.toString() === productId,
  );
  if (existing) {
    const newQuantity = existing.quantity + quantity;
    if (product.stock < newQuantity)
      throw Object.assign(new Error("Insufficient stock"), { statusCode: 400 });
    existing.quantity = newQuantity;
  } else {
    user.cart.push({ product: productId, quantity });
  }

  await user.save();
  return user.populate("cart.product", "name price images stock");
};

const updateQuantity = async (userId, productId, quantity) => {
  const user = await User.findById(userId);
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const product = await Product.findById(productId);
  if (!product)
    throw Object.assign(new Error("Product not found"), { statusCode: 404 });
  if (product.stock < quantity)
    throw Object.assign(new Error("Insufficient stock"), { statusCode: 400 });

  const item = user.cart.find((cart) => cart.product.toString() === productId);
  if (!item)
    throw Object.assign(new Error("Item not in cart"), { statusCode: 404 });

  item.quantity = quantity;
  await user.save();
  return user.populate("cart.product", "name price images stock");
};

const removeFromCart = async (userId, productId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { cart: { product: productId } } },
    { new: true },
  ).populate("cart.product", "name price images stock");
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user.cart;
};

const clearCart = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { cart: [] } },
    { new: true },
  );
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return [];
};

const syncCart = async (userId, localItems) => {
  const user = await User.findById(userId);
  if (!user)
    throw Object.assign(new Error("User not found"), { statusCode: 404 });

  const merged = [...user.cart];
  for (const local of localItems) {
    const product = await Product.findById(local.productId).where(
      "isActive",
      true,
    );
    if (!product) continue;

    const existing = merged.find(
      (cart) => cart.product.toString() === local.productId,
    );
    if (existing) {
      const newQuantity = Math.min(
        existing.quantity + local.quantity,
        product.stock,
      );
      existing.quantity = newQuantity;
    } else {
      merged.push({
        product: local.productId,
        quantity: Math.min(local.quantity, product.stock),
      });
    }
  }

  user.cart = merged;
  await user.save();
  return user.populate("cart.product", "name price images stock");
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  syncCart,
};
