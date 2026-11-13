import { Router } from "express";

import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Apply JWT authentication to all routes
router.use(verifyJWT);

// Create tweet
router.route("/").post(createTweet);

// Get user's tweets
router.route("/user/:userId").get(getUserTweets);

// Update and delete tweet
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
