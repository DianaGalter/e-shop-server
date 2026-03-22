const orderService = require("./order.service");

const create = async (req, res, next) => {
  try {
    const order = await orderService.create(req.user._id, req.body);
    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getMyOrders(req.user._id);
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const order = await orderService.getById(
      req.params.id,
      req.user._id,
      req.user.role,
    );
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await orderService.getAll(Number(page), Number(limit));
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateStatus(
      req.params.id,
      req.body.orderStatus,
      req.body.trackingNumber,
    );
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

const cancel = async (req, res, next) => {
  try {
    const order = await orderService.cancel(req.params.id, req.user._id);
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getMyOrders, getById, getAll, updateStatus, cancel };
