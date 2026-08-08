import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  addEpisode,
  getEpisodesByContent,
  getAllEpisodes,
  updateEpisode,
  deleteEpisode,
} from "../controllers/episodeController.js";

const router = express.Router();

// Explicit path so this never collides with `/:contentId` (some clients/proxies normalize `/episodes` oddly).
router.get("/admin/all", authMiddleware, adminMiddleware, getAllEpisodes);
router.get("/:contentId", getEpisodesByContent);

router.post("/", authMiddleware, adminMiddleware, addEpisode);
router.put("/:id", authMiddleware, adminMiddleware, updateEpisode);
router.delete("/:id", authMiddleware, adminMiddleware, deleteEpisode);

export default router; // ✅ THIS LINE IS REQUIRED
