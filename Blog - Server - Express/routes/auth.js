const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middlewares/is-auth');

router.put(
  '/signup',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email address.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(user => {
          if (user) {
            return Promise.reject(
              'An account already exists for this email address.'
            );
          }
        });
      }),
    body('password').trim().isLength({ min: 6 }),
    body('name').trim().isLength({ min: 3 }).isAlpha(),
  ],
  authController.signup
);

router.post(
  '/login',
  [
    body('email')
      .notEmpty()
      .isEmail()
      .withMessage('Invalid email address')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (!userDoc) {
            return Promise.reject('Could not find your account.');
          }
        });
      }),
    body('password').trim().isLength({ min: 6 }),
  ],
  authController.login
);

router.get('/status', isAuth, authController.getUserStatus);

router.patch(
  '/status',
  isAuth,
  [body('status').trim().notEmpty()],
  authController.updateUserStatus
);
module.exports = router;
