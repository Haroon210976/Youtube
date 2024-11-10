import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from '../controllers/tweet.controller.js';

const router = Router();
router.use(verifyJWT);

router.route('/').post(createTweet);
router.route('/user/:userId').get(getUserTweets);
router.route('/update/:tweetId').patch(updateTweet);
router.route('/delete/:tweetId').delete(deleteTweet);

export default router;
