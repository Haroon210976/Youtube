import { Router } from 'express';
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/:videoId').get(getVideoComments);
router.route('/add/:videoId').post(addComment);
router.route('/delete/:commentId').delete(deleteComment);
router.route('/update/:commentId').patch(updateComment);

export default router;
