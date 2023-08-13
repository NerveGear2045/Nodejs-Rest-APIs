const express = require('express');
const { check, body } = require('express-validator');

const feedController = require('../controllers/feed');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

router.get('/posts', isAuth, feedController.getPosts);

router.post(
  '/post',
  isAuth,
  [
    body('title').trim().isLength({ min: 5 }),
    check('content').trim().isLength({ min: 5, max: 400 }),
  ],
  feedController.createPost
);

router.get('/post/:postId', feedController.getPost);

router.put(
  '/post/:postId',
  isAuth,
  [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
  ],
  feedController.editPost
);

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;
