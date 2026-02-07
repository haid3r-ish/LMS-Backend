require("module-alias/register")

const jwt = require('jsonwebtoken');

const {CatchAsync, AppError} = require('@util/errorHandler');
const {verifyToken} = require("@util/jwtHandler")

/**
 * Authentication Middleware
 * @param {...String} roles - (Optional) List of allowed roles e.g. 'instructor', 'admin'
 */
const auth = (...roles) => {
  return CatchAsync(async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verification token
    const { userData, sessionCookie } = await verifyToken(token);
    
    req.user = userData;

    if (sessionCookie) {
      res.cookie("sessionCookie", sessionCookie, {
          secure: process.env.NODE_ENV === "production",
          maxAge: parseInt(process.env.JWT_MAIN_EXPIRY) * 1000,
      });
    }

    // 5) Role Restriction (Authorization)
    if (roles.length > 0 && !roles.includes(userData.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  });
};

module.exports = auth;