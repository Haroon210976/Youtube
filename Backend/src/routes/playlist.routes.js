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

router.route('/').post(createPlaylist).get(getAllPlaylists);

router.route('/add/:videoId/:playlistId').patch(addVideoToPlaylist);
router.route('/remove/:videoId/:playlistId').patch(removeVideoFromPlaylist);
router.route('/update/:playlistId').patch(updatePlaylist);
router.route('/delete/:playlistId').delete(deletePlaylist);

router.route('/:playlistId').get(getPlaylistById);
router.route('/user/:userId').get(getUserPlaylists);

router.route('/:playlistId/videos').get(getAllVideosOfPlaylist);
router.route('/video/:videoId').get(getAllPlaylistsOfVideo);

export default router;
