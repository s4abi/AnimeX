const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only" });
    }

    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);
    return res
      .status(500)
      .json({ message: "Server error in admin middleware" });
  }
};

export default adminMiddleware;
