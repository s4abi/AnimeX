import pool from "../config/db.js";
import { wantsDuplicateConfirm } from "../utils/duplicateConfirm.js";

export const addEpisode = async (req, res) => {
  try {
    const { content_id, episode_number, title, video_url, duration } = req.body;

    if (
      !content_id ||
      !episode_number ||
      !title?.trim() ||
      !video_url?.trim()
    ) {
      return res.status(400).json({
        message:
          "content_id, episode_number, title, and video_url are required.",
      });
    }

    if (Number(episode_number) <= 0) {
      return res
        .status(400)
        .json({ message: "Episode number must be greater than 0." });
    }

    const confirmDup = wantsDuplicateConfirm(req.body);
    const [byNumber] = await pool.query(
      `
      SELECT id, episode_number, title
      FROM episodes
      WHERE content_id = ? AND episode_number = ?
      `,
      [content_id, episode_number],
    );
    const [byTitle] = await pool.query(
      `
      SELECT id, episode_number, title
      FROM episodes
      WHERE content_id = ? AND LOWER(TRIM(title)) = LOWER(TRIM(?))
      `,
      [content_id, title.trim()],
    );
    const seen = new Set();
    const matches = [];
    for (const row of [...byNumber, ...byTitle]) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        matches.push(row);
      }
    }

    if (matches.length > 0 && !confirmDup) {
      return res.status(409).json({
        code: "DUPLICATE_EPISODE",
        message:
          "This show already has an episode with the same number and/or the same title. Submit again with confirm_duplicate if you still want to add it.",
        matches,
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO episodes (content_id, episode_number, title, video_url, duration)
      VALUES (?, ?, ?, ?, ?)
      `,
      [content_id, episode_number, title, video_url, duration || null],
    );

    res.status(201).json({
      message: "Episode added successfully.",
      episodeId: result.insertId,
    });
  } catch (error) {
    console.error("Add Episode Error:", error);
    res.status(500).json({ message: "Unable to add episode right now." });
  }
};

export const getEpisodesByContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT id, content_id, episode_number, title, video_url, duration, created_at
      FROM episodes
      WHERE content_id = ?
      ORDER BY episode_number ASC
      `,
      [contentId],
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Get Episodes Error:", error);
    res.status(500).json({ message: "Unable to fetch episodes right now." });
  }
};

export const getAllEpisodes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        episodes.id,
        episodes.content_id,
        episodes.episode_number,
        episodes.title,
        episodes.video_url,
        episodes.duration,
        contents.title AS content_title
      FROM episodes
      INNER JOIN contents ON episodes.content_id = contents.id
      ORDER BY contents.title ASC, episodes.episode_number ASC
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Get All Episodes Error:", error);
    res
      .status(500)
      .json({ message: "Unable to fetch episodes right now." });
  }
};

export const updateEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const { content_id, episode_number, title, video_url, duration } = req.body;

    if (
      !content_id ||
      !episode_number ||
      !title?.trim() ||
      !video_url?.trim()
    ) {
      return res.status(400).json({
        message:
          "content_id, episode_number, title, and video_url are required.",
      });
    }

    if (Number(episode_number) <= 0) {
      return res
        .status(400)
        .json({ message: "Episode number must be greater than 0." });
    }

    const confirmDup = wantsDuplicateConfirm(req.body);
    const [byNumber] = await pool.query(
      `
      SELECT id, episode_number, title
      FROM episodes
      WHERE content_id = ? AND episode_number = ? AND id != ?
      `,
      [content_id, episode_number, id],
    );
    const [byTitle] = await pool.query(
      `
      SELECT id, episode_number, title
      FROM episodes
      WHERE content_id = ? AND LOWER(TRIM(title)) = LOWER(TRIM(?)) AND id != ?
      `,
      [content_id, title.trim(), id],
    );
    const seen = new Set();
    const matches = [];
    for (const row of [...byNumber, ...byTitle]) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        matches.push(row);
      }
    }

    if (matches.length > 0 && !confirmDup) {
      return res.status(409).json({
        code: "DUPLICATE_EPISODE",
        message:
          "Another episode on this show already uses this number and/or title. Confirm to save anyway.",
        matches,
      });
    }

    const [result] = await pool.query(
      `
      UPDATE episodes
      SET content_id = ?, episode_number = ?, title = ?, video_url = ?, duration = ?
      WHERE id = ?
      `,
      [content_id, episode_number, title, video_url, duration || null, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Episode not found." });
    }

    res.status(200).json({ message: "Episode updated successfully." });
  } catch (error) {
    console.error("Update Episode Error:", error);
    res.status(500).json({ message: "Unable to update episode right now." });
  }
};

export const deleteEpisode = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM episodes WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Episode not found." });
    }

    res.status(200).json({ message: "Episode deleted successfully." });
  } catch (error) {
    console.error("Delete Episode Error:", error);
    res.status(500).json({ message: "Unable to delete episode right now." });
  }
};
