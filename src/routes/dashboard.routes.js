import { Router } from "express";

import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Apply JWT authentication to all routes
router.use(verifyJWT);

// Dashboard statistics
router.route("/stats").get(getChannelStats);

// Dashboard videos
router.route("/videos").get(getChannelVideos);

export default router;
