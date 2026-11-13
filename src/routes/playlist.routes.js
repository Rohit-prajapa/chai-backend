import { Router } from "express";

import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Apply JWT authentication to all routes
router.use(verifyJWT);

// Create playlist
router.route("/").post(createPlaylist);

// Get, update and delete playlist
router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

// Add video to playlist
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);

// Remove video from playlist
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

// Get user's playlists
router.route("/user/:userId").get(getUserPlaylists);

export default router;
