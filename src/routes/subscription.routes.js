import { Router } from "express";

import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Apply JWT authentication to all routes
router.use(verifyJWT);

// Get subscribed channels and toggle subscription
router
  .route("/c/:channelId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

// Get user's channel subscribers
router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router;
