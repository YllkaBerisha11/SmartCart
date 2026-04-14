const jwt = require("jsonwebtoken");

// Middleware: Verifikon JWT Token
const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Token i pasaktë!" });
    }
  }
  if (!token) {
    return res.status(401).json({ message: "Aksesi i mohuar, nuk ka token!" });
  }
};

// Middleware: Kontrollon Rolin (admin/user)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Roli '${req.user?.role}' nuk ka leje për këtë veprim!` 
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };