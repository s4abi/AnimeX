import pool from "../config/db.js";

export const addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content_id } = req.body;

    if (!content_id) {
      return res.status(400).json({ message: "content_id is required." });
    }

    const [existing] = await pool.query(
      "SELECT * FROM watchlist WHERE user_id = ? AND content_id = ?",
      [userId, content_id],
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "This item is already in your watchlist." });
    }

    await pool.query(
      "INSERT INTO watchlist (user_id, content_id) VALUES (?, ?)",
      [userId, content_id],
    );

    res.status(201).json({ message: "Added to watchlist successfully." });
  } catch (error) {
    console.error("Add To Watchlist Error:", error);
    res.status(500).json({ message: "Unable to add item to watchlist right now." });
  }
};

export const getUserWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        watchlist.id AS watchlist_id,
        contents.id,
        contents.title,
        contents.description,
        contents.thumbnail,
        contents.banner_image,
        contents.type,
        contents.release_year,
        contents.rating,
        contents.language,
        categories.name AS category_name
      FROM watchlist
      INNER JOIN contents ON watchlist.content_id = contents.id
      LEFT JOIN categories ON contents.category_id = categories.id
      WHERE watchlist.user_id = ?
      ORDER BY watchlist.created_at DESC
      `,
      [userId],
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Get Watchlist Error:", error);
    res.status(500).json({ message: "Unable to fetch watchlist right now." });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { contentId } = req.params;

    const [result] = await pool.query(
      "DELETE FROM watchlist WHERE user_id = ? AND content_id = ?",
      [userId, contentId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found in watchlist." });
    }

    res.status(200).json({ message: "Removed from watchlist successfully." });
  } catch (error) {
    console.error("Remove From Watchlist Error:", error);
    res
      .status(500)
      .json({ message: "Unable to remove item from watchlist right now." });
  }
};
