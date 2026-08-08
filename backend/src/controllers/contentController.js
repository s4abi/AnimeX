import pool from "../config/db.js";
import { wantsDuplicateConfirm } from "../utils/duplicateConfirm.js";

export const getAllContents = async (req, res) => {
  try {
    const { search = "", type = "", category = "" } = req.query;

    let query = `
      SELECT 
        contents.id,
        contents.title,
        contents.description,
        contents.thumbnail,
        contents.banner_image,
        contents.type,
        contents.release_year,
        contents.rating,
        contents.language,
        contents.created_at,
        categories.name AS category_name,
        contents.category_id
      FROM contents
      LEFT JOIN categories ON contents.category_id = categories.id
      WHERE 1 = 1
    `;

    const values = [];

    if (search) {
      query += ` AND contents.title LIKE ? `;
      values.push(`%${search}%`);
    }

    if (type) {
      query += ` AND contents.type = ? `;
      values.push(type);
    }

    if (category) {
      query += ` AND categories.name = ? `;
      values.push(category);
    }

    query += ` ORDER BY contents.created_at DESC `;

    const [rows] = await pool.query(query, values);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Get All Contents Error:", error);
    res.status(500).json({ message: "Unable to fetch content right now." });
  }
};

export const getSingleContent = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        contents.id,
        contents.title,
        contents.description,
        contents.thumbnail,
        contents.banner_image,
        contents.type,
        contents.release_year,
        contents.rating,
        contents.language,
        categories.name AS category_name,
        contents.category_id
      FROM contents
      LEFT JOIN categories ON contents.category_id = categories.id
      WHERE contents.id = ?
      `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "The requested content was not found." });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get Single Content Error:", error);
    res.status(500).json({ message: "Unable to fetch content details right now." });
  }
};

export const createContent = async (req, res) => {
  try {
    const {
      title,
      description,
      thumbnail,
      banner_image,
      type,
      release_year,
      rating,
      language,
      category_id,
    } = req.body;

    if (!title?.trim() || !description?.trim() || !type?.trim()) {
      return res.status(400).json({
        message: "Title, description, and type are required.",
      });
    }

    if (!language?.trim()) {
      return res.status(400).json({ message: "Language is required." });
    }

    if (!["anime", "movie", "series"].includes(type)) {
      return res.status(400).json({ message: "Invalid content type. Use anime, movie, or series." });
    }

    if (release_year && (release_year < 1900 || release_year > 2100)) {
      return res.status(400).json({ message: "Release year must be between 1900 and 2100." });
    }

    if (rating && (rating < 0 || rating > 10)) {
      return res
        .status(400)
        .json({ message: "Rating must be between 0 and 10." });
    }

    const confirmDup = wantsDuplicateConfirm(req.body);
    const [titleDupes] = await pool.query(
      `
      SELECT id, title, type, release_year
      FROM contents
      WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND type = ?
      `,
      [title, type],
    );

    if (titleDupes.length > 0 && !confirmDup) {
      return res.status(409).json({
        code: "DUPLICATE_CONTENT",
        message:
          "Content with the same title and type already exists. Submit again with confirm_duplicate if you want to create another row anyway.",
        matches: titleDupes,
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO contents
      (title, description, thumbnail, banner_image, type, release_year, rating, language, category_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description,
        thumbnail || null,
        banner_image || null,
        type,
        release_year || null,
        rating || 0.0,
        language || "Hindi",
        category_id || null,
        req.user.id,
      ],
    );

    res.status(201).json({
      message: "Content created successfully.",
      contentId: result.insertId,
    });
  } catch (error) {
    console.error("Create Content Error:", error);
    res.status(500).json({ message: "Unable to create content right now." });
  }
};

export const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      thumbnail,
      banner_image,
      type,
      release_year,
      rating,
      language,
      category_id,
    } = req.body;

    if (!title?.trim() || !description?.trim() || !type?.trim()) {
      return res.status(400).json({
        message: "Title, description, and type are required.",
      });
    }

    if (!language?.trim()) {
      return res.status(400).json({ message: "Language is required." });
    }

    if (!["anime", "movie", "series"].includes(type)) {
      return res.status(400).json({ message: "Invalid content type. Use anime, movie, or series." });
    }

    if (release_year && (release_year < 1900 || release_year > 2100)) {
      return res.status(400).json({ message: "Release year must be between 1900 and 2100." });
    }

    if (rating && (rating < 0 || rating > 10)) {
      return res.status(400).json({ message: "Rating must be between 0 and 10." });
    }

    const confirmDup = wantsDuplicateConfirm(req.body);
    const [titleDupes] = await pool.query(
      `
      SELECT id, title, type, release_year
      FROM contents
      WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) AND type = ? AND id != ?
      `,
      [title, type, id],
    );

    if (titleDupes.length > 0 && !confirmDup) {
      return res.status(409).json({
        code: "DUPLICATE_CONTENT",
        message:
          "Another title already uses this name with the same type. Confirm if you still want to save (may confuse users).",
        matches: titleDupes,
      });
    }

    const [result] = await pool.query(
      `
      UPDATE contents
      SET
        title = ?,
        description = ?,
        thumbnail = ?,
        banner_image = ?,
        type = ?,
        release_year = ?,
        rating = ?,
        language = ?,
        category_id = ?
      WHERE id = ?
      `,
      [
        title,
        description,
        thumbnail || null,
        banner_image || null,
        type,
        release_year || null,
        rating || 0.0,
        language || "Hindi",
        category_id || null,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "The requested content was not found." });
    }

    res.status(200).json({ message: "Content updated successfully." });
  } catch (error) {
    console.error("Update Content Error:", error);
    res.status(500).json({ message: "Unable to update content right now." });
  }
};

export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM contents WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "The requested content was not found." });
    }

    res.status(200).json({ message: "Content deleted successfully." });
  } catch (error) {
    console.error("Delete Content Error:", error);
    res.status(500).json({ message: "Unable to delete content right now." });
  }
};
