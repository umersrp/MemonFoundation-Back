const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ status: 401, message: "Authorization header is missing" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res
        .status(401)
        .json({
          status: 401,
          message: "Invalid token format. Use Bearer token",
        });
    }

    const token = parts[1];
    let user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: 401, message: error.message });
  }
};

const verifyTutor = (req, res, next) => {
  try {
    verifyToken(req, res, () => {
      if (req.user.type === "admin" || req.user.type === "tutor") {
        next();
      } else {
        return res
          .status(401)
          .json({ status: 401, message: "You are not authenticated!" });
      }
    });
  } catch (error) {
    return res.status(401).json({ status: 401, message: error.message });
  }
};

const verifyTokenAndAdmin = (req, res, next) => {
  try {
    verifyToken(req, res, () => {
      if (req.user.type === "superadmin") {
        next();
      } else {
        return res
          .status(401)
          .json({ status: 401, message: "You are not authenticated!" });
      }
    });
  } catch (error) {
    return res.status(401).json({ status: 401, message: error.message });
  }
};

const verifyTokenAndAdminOrSchool = (req, res, next) => {
  try {
    verifyToken(req, res, () => {
      if (req.user.type === "superadmin" || req.user.type === "school") {
        next();
      } else {
        return res
          .status(401)
          .json({ status: 401, message: "You are not authenticated!" });
      }
    });
  } catch (error) {
    return res.status(401).json({ status: 401, message: error.message });
  }
};

const verifyTokenOptional = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return next();
    try {
      req.user = jwt.verify(parts[1], process.env.JWT_SECRET);
    } catch (e) {
      // ignore invalid token for optional auth
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  verifyToken,
  verifyTutor,
  verifyTokenAndAdmin,
  verifyTokenAndAdminOrSchool,
  verifyTokenOptional,
};
