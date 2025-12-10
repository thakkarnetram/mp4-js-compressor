import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const requireAuth = (req, res, next) => {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth) return res.status(401).json({ message: "Unauthorized: missing token" });

    const parts = auth.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ message: "Unauthorized: malformed token" });
    }

    const token = parts[1];
    try {
        const JWT_SECRET = process.env.SECRET_KEY;
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        console.error("JWT verify failed:", err.message);
        return res.status(401).json({ message: "Unauthorized: invalid token" });
    }
};

export const optionalAuth = (req, res, next) => {
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth) return next();

    const parts = auth.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return next();

    const token = parts[1];
    try {
      const payload = jwt.verify(token, process.env.SECRET_KEY);
      req.user = payload;
    } catch (err) {
      console.warn("optionalAuth: invalid token:", err.message);
    }
  } catch (e) {
    console.warn("optionalAuth: unexpected error", e);
  }
  return next();
};