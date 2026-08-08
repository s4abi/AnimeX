import pool from "../config/db.js";

export const getCurrentUser = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, role, profile_pic, created_at FROM users WHERE id = ?",
      [req.user.id],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(users[0]);
  } catch (error) {
    console.error("Get Current User Error:", error);
    res.status(500).json({ message: "Server error while fetching user" });
  }
};
