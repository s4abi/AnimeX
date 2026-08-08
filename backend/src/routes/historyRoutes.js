import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  saveWatchHistory,
  getWatchHistory,
  getContinueWatching,
} from "../controllers/historyController.js";

const router = express.Router();

router.get("/continue-watching", authMiddleware, getContinueWatching);
router.get("/", authMiddleware, getWatchHistory);
router.post("/", authMiddleware, saveWatchHistory);

export default router;
