import { Router } from "express";

import {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Get comments for a video (public)
router.route("/:videoId").get(getVideoComments);

// Protected routes
router.use(verifyJWT);

// Add a comment
router.route("/:videoId").post(addComment);

// Update or delete a comment
router.route("/c/:commentId").patch(updateComment).delete(deleteComment);

export default router;
