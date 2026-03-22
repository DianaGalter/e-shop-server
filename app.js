require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const path = require("path");
const { corsOptions } = require("./config/cors.config");
const { apiLimiter } = require("./shared/middleware/rateLimiter.middleware");
const errorHandler = require("./shared/middleware/errorHandler.middleware");

const authRouter = require("./src/features/auth/auth.router");
const productsRouter = require("./features/products/product.router");
const ordersRouter = require("./src/features/orders/order.router");
const usersRouter = require("./features/users/user.router");
const cartRouter = require("./src/features/cart/cart.router");

const app = express();

app.use(helmet());
app.use(hpp());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(require("morgan")("dev"));
}

app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));
app.use(apiLimiter);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/cart", cartRouter);

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "OK" }),
);

app.use(errorHandler);

module.exports = app;
