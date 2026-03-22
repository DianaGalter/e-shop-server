const cartService = require("./cart.service");

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user._id);
    res.json({ success: true, cart });
  } catch (err) {
    next(err);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const user = await cartService.addToCart(
      req.user._id,
      req.body.productId,
      req.body.quantity,
    );
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    next(err);
  }
};

const updateQuantity = async (req, res, next) => {
  try {
    const quantity = req.body.quantity;
    const user = await cartService.updateQuantity(
      req.user._id,
      req.params.productId,
      quantity,
    );
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    next(err);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const cart = await cartService.removeFromCart(
      req.user._id,
      req.params.productId,
    );
    res.json({ success: true, cart });
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    await cartService.clearCart(req.user._id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const syncCart = async (req, res, next) => {
  try {
    const user = await cartService.syncCart(req.user._id, req.body.items);
    res.json({ success: true, cart: user.cart });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  syncCart,
};
