const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // Kontrollon nëse në Header vjen: Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Merr vetëm kodin e token-it (heq fjalën Bearer)
      token = req.headers.authorization.split(" ")[1];

      // Verifikon token-in me çelësin tonë sekret nga .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Shton të dhënat e përdoruesit në kërkesë që t'i përdorim në rrugët e tjera
      req.user = decoded;

      next(); // Kalon te funksioni i radhës
    } catch (error) {
      return res.status(401).json({ message: "Token i pasaktë, autorizimi dështoi!" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Nuk u gjet asnjë Token, aksesi i mohuar!" });
  }
};

module.exports = { protect };