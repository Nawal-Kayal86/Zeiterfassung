import jwt from "jsonwebtoken";

export function auth(requiredRole = null) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: "Kein Token vorhanden" });

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ error: "Zugriff verweigert" });
      }

      req.user = decoded;
      next();
    } catch (err) {
      console.error("Auth error:", err);
      res.status(401).json({ error: "Ungültiges Token" });
    }
  };
}
