import express from "express";
import {
  getAllContents,
  getSingleContent,
  createContent,
  updateContent,
  deleteContent,
} from "../controllers/contentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllContents);
router.get("/:id", getSingleContent);
router.post("/", authMiddleware, createContent);
router.put("/:id", authMiddleware, updateContent);
router.delete("/:id", authMiddleware, deleteContent);

export default router;
