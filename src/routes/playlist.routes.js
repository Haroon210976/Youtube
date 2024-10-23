import { Router } from 'express';
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  getAllPlaylistsOfVideo,
  getAllPlaylists,
  getAllVideosOfPlaylist,
} from '../controllers/playlist.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyJWT);

export default router;
