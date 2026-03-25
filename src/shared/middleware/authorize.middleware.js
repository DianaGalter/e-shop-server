const authorize = (...allowedRoles) => {
  return (request, response, next) => {
    if (!request.user) {
      return response.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = authorize;
