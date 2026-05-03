import express from "express";
import {
  getPublishedPosts,
  getPostBySlug,
  getAllPostsAdmin,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import { protectAdmin } from "../middlewares/authAdmin.js";

const router = express.Router();

// =========================
// ADMIN
// =========================
router.get("/admin/all", protectAdmin, getAllPostsAdmin);
router.post("/", protectAdmin, createPost);
router.put("/:id", protectAdmin, updatePost);
router.delete("/:id", protectAdmin, deletePost);

// =========================
// PUBLIC
// =========================
router.get("/", getPublishedPosts);
router.get("/:slug", getPostBySlug);

export default router;