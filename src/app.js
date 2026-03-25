const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const path = require("path");
const { corsOptions } = require("./config/cors.config");
const { apiLimiter } = require("./shared/middleware/rateLimiter.middleware");
const errorHandler = require("./shared/middleware/errorHandler.middleware");

const authRouter = require("./features/auth/auth.router");
const productsRouter = require("./features/products/products.router");
const ordersRouter = require("./features/orders/order.router");
const usersRouter = require("./features/users/users.router");
const cartRouter = require("./features/cart/cart.router");

const application = express();

application.use(helmet());
application.use(hpp());
application.use(cors(corsOptions));
application.use(express.json());
application.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  application.use(require("morgan")("dev"));
}

const uploadsDirectory = path.join(__dirname, "../uploads");
application.use("/uploads", express.static(uploadsDirectory));
application.use(apiLimiter);

application.use("/api/v1/auth", authRouter);
application.use("/api/v1/products", productsRouter);
application.use("/api/v1/orders", ordersRouter);
application.use("/api/v1/users", usersRouter);
application.use("/api/v1/cart", cartRouter);

application.get("/api/v1/health", (request, response) => {
  response.json({ success: true, message: "OK" });
});

application.use(errorHandler);

module.exports = application;
