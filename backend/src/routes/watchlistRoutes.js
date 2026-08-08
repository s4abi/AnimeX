import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addToWatchlist,
  getUserWatchlist,
  removeFromWatchlist,
} from "../controllers/watchlistController.js";

const router = express.Router();

router.get("/", authMiddleware, getUserWatchlist);
router.post("/", authMiddleware, addToWatchlist);
router.delete("/:contentId", authMiddleware, removeFromWatchlist);

export default router;
