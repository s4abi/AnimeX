import pool from "../config/db.js";

const truthy = (v) => v === true || v === "true" || v === 1 || v === "1";

export const saveWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content_id, episode_id, progress } = req.body;
    const touchOnly = truthy(req.body.touch_only);

    if (!content_id) {
      return res.status(400).json({ message: "content_id is required." });
    }

    const [existing] = await pool.query(
      `
      SELECT id, progress FROM watch_history
      WHERE user_id = ? AND content_id = ? AND (
        (episode_id = ?) OR (episode_id IS NULL AND ? IS NULL)
      )
      `,
      [userId, content_id, episode_id || null, episode_id || null],
    );

    if (existing.length > 0) {
      if (touchOnly) {
        await pool.query(
          `UPDATE watch_history SET watched_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [existing[0].id],
        );
        return res.status(200).json({ message: "Watch activity refreshed." });
      }

      await pool.query(
        `
        UPDATE watch_history
        SET progress = ?, watched_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [progress ?? 0, existing[0].id],
      );

      return res.status(200).json({ message: "Watch history updated successfully." });
    }

    if (touchOnly) {
      await pool.query(
        `
        INSERT INTO watch_history (user_id, content_id, episode_id, progress, watched_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        [userId, content_id, episode_id || null, 0],
      );
      return res.status(201).json({ message: "Watch history started." });
    }

    await pool.query(
      `
      INSERT INTO watch_history (user_id, content_id, episode_id, progress, watched_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [userId, content_id, episode_id || null, progress ?? 0],
    );

    res.status(201).json({ message: "Watch history saved successfully." });
  } catch (error) {
    console.error("Save Watch History Error:", error);
    res
      .status(500)
      .json({ message: "Unable to save watch history right now." });
  }
};

export const getWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        wh.id,
        wh.progress,
        wh.watched_at,
        c.id AS content_id,
        c.title AS content_title,
        c.thumbnail,
        c.banner_image,
        c.type,
        c.release_year,
        c.rating,
        e.id AS episode_id,
        e.episode_number,
        e.title AS episode_title
      FROM watch_history wh
      INNER JOIN contents c ON wh.content_id = c.id
      LEFT JOIN episodes e ON wh.episode_id = e.id
      WHERE wh.user_id = ?
      ORDER BY wh.watched_at DESC
      `,
      [userId],
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Get Watch History Error:", error);
    res
      .status(500)
      .json({ message: "Unable to fetch watch history right now." });
  }
};

/** In-progress titles only, last activity within 7 days, one row per content (latest watch). */
export const getContinueWatching = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        wh.id,
        wh.progress,
        wh.watched_at,
        c.id AS content_id,
        c.title AS content_title,
        c.thumbnail,
        c.banner_image,
        c.type,
        c.release_year,
        c.rating,
        e.id AS episode_id,
        e.episode_number,
        e.title AS episode_title
      FROM watch_history wh
      INNER JOIN contents c ON wh.content_id = c.id
      LEFT JOIN episodes e ON wh.episode_id = e.id
      WHERE wh.user_id = ?
        AND wh.watched_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND wh.progress < 100
      ORDER BY wh.watched_at DESC
      `,
      [userId],
    );

    const byContent = new Map();
    for (const row of rows) {
      const key = row.content_id;
      const prev = byContent.get(key);
      if (
        !prev ||
        new Date(row.watched_at).getTime() > new Date(prev.watched_at).getTime()
      ) {
        byContent.set(key, row);
      }
    }

    const deduped = [...byContent.values()].sort(
      (a, b) => new Date(b.watched_at) - new Date(a.watched_at),
    );

    res.status(200).json(deduped);
  } catch (error) {
    console.error("Get Continue Watching Error:", error);
    res
      .status(500)
      .json({ message: "Unable to fetch continue watching right now." });
  }
};
