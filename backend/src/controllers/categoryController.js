import pool from "../config/db.js";

export const getAllCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, created_at FROM categories ORDER BY name ASC",
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({ message: "Server error while fetching categories" });
  }
};
