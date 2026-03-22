const Order = require("./order.model");
const Product = require("../products/product.model");
const User = require("../users/user.model");
const {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
} = require("../../services/email.service");

const create = async (userId, data) => {
  const orderItems = [];
  let totalPrice = 0;
  const SHIPPING_COST = 30;

  for (const item of data.items) {
    const product = await Product.findById(item.productId).where(
      "isActive",
      true,
    );
    if (!product)
      throw Object.assign(new Error(`Product ${item.productId} not found`), {
        statusCode: 404,
      });
    if (product.stock < item.quantity)
      throw Object.assign(new Error(`Insufficient stock for ${product.name}`), {
        statusCode: 400,
      });

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.images?.[0],
    });
    totalPrice += product.price * item.quantity;
  }

  totalPrice += SHIPPING_COST;

  const bulkOps = data.items.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { stock: -item.quantity, sold: item.quantity } },
    },
  }));

  await Product.bulkWrite(bulkOps);

  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress: data.shippingAddress,
    totalPrice,
    shippingCost: SHIPPING_COST,
    paymentMethod: data.paymentMethod,
    notes: data.notes,
    paymentStatus: "paid",
  });

  await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

  const user = await User.findById(userId);
  await sendOrderConfirmation(user.email, order);

  return Order.findById(order._id).populate("user", "name email");
};

const getMyOrders = async (userId) => {
  return Order.find({ user: userId }).sort("-createdAt").lean();
};

const getById = async (id, userId, role) => {
  const order = await Order.findById(id).populate("user", "name email");
  if (!order)
    throw Object.assign(new Error("Order not found"), { statusCode: 404 });
  if (role !== "admin" && order.user._id.toString() !== userId) {
    throw Object.assign(new Error("Access denied"), { statusCode: 403 });
  }
  return order;
};

const getAll = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find()
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .lean(),
    Order.countDocuments(),
  ]);
  return {
    data: orders,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalCount: total,
  };
};

const updateStatus = async (id, status, trackingNumber) => {
  const order = await Order.findByIdAndUpdate(
    id,
    { orderStatus: status, trackingNumber },
    { new: true },
  ).populate("user", "email");
  if (!order)
    throw Object.assign(new Error("Order not found"), { statusCode: 404 });
  await sendOrderStatusUpdate(order.user.email, order._id, status);
  return order;
};

const cancel = async (id, userId) => {
  const order = await Order.findById(id);
  if (!order)
    throw Object.assign(new Error("Order not found"), { statusCode: 404 });
  if (order.user.toString() !== userId)
    throw Object.assign(new Error("Access denied"), { statusCode: 403 });
  if (order.orderStatus !== "pending")
    throw Object.assign(new Error("Cannot cancel order in current status"), {
      statusCode: 400,
    });

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, sold: -item.quantity },
    });
  }

  order.orderStatus = "cancelled";
  await order.save();
  return order;
};

module.exports = { create, getMyOrders, getById, getAll, updateStatus, cancel };
