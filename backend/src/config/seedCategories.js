import pool from "./db.js";

/** Inserted only when `categories` has zero rows — safe for existing databases. */
const DEFAULT_CATEGORY_NAMES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Isekai",
  "Romance",
  "Sci-Fi",
  "Shonen",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
];

export async function seedDefaultCategories() {
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM categories",
    );
    const cnt = Number(rows[0]?.cnt ?? 0);
    if (cnt > 0) return;

    const placeholders = DEFAULT_CATEGORY_NAMES.map(() => "(?)").join(", ");
    await pool.query(
      `INSERT INTO categories (name) VALUES ${placeholders}`,
      DEFAULT_CATEGORY_NAMES,
    );
    console.log(
      `Seeded ${DEFAULT_CATEGORY_NAMES.length} default categories (table was empty).`,
    );
  } catch (error) {
    console.error(
      "Could not seed categories (check DB schema / permissions):",
      error.message,
    );
  }
}
