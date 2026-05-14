// server/routes/postRoutes.js

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

/**
 * =========================
 * ADMIN (WAJIB DI ATAS)
 * =========================
 * GET    /api/posts/admin/all   -> list semua
 * POST   /api/posts             -> create
 * PUT    /api/posts/:id         -> update
 * DELETE /api/posts/:id         -> delete
 */
router.get("/admin/all", protectAdmin, getAllPostsAdmin);
router.post("/", protectAdmin, createPost);
router.put("/:id", protectAdmin, updatePost);
router.delete("/:id", protectAdmin, deletePost);

/**
 * =========================
 * PUBLIC
 * =========================
 * GET /api/posts              -> list published
 * GET /api/posts/slug/:slug   -> detail by slug (AMAN)
 */
router.get("/", getPublishedPosts);
router.get("/slug/:slug", getPostBySlug);

export default router;