import Router from 'express';
import session from 'express-session';
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from '../controllers/video.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();
router.use(verifyJWT);

router
  .route('/')
  .get(getAllVideos)
  .post(
    upload.fields([
      {
        name: 'videoFile',
        maxCount: 1,
      },
      {
        name: 'thumbnail',
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

router.route('/delete/:videoId').delete(deleteVideo);
router.route('/update/:videoId').patch(upload.single('thumbnail'), updateVideo);
router.route('/:videoId').get(
  session({
    secret: 'secret-key', // Change this to a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  }),
  getVideoById
);

router.route('/toggle/publish/:videoId').patch(togglePublishStatus);

export default router;
