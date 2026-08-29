const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  if (!process.env.JWT_SECRET) {
    return res.status(503).json({ error: "Authentication is not configured" });
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = authMiddleware;
