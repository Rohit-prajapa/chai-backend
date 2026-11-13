import { Router } from "express";

import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
} from "../controllers/like.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Apply JWT authentication to all routes
router.use(verifyJWT);

// Toggle video like
router.route("/toggle/v/:videoId").post(toggleVideoLike);

// Toggle comment like
router.route("/toggle/c/:commentId").post(toggleCommentLike);

// Toggle tweet like
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

// Get all liked videos
router.route("/videos").get(getLikedVideos);

export default router;
