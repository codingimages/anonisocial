const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').not().isEmpty(),
    check('password', 'Password is required at least 6 characters').isLength({
      min: 6,
    }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // see if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
      // get users gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });
      // encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // return json web token
      const payload = {
        user: {
          id: user._id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000000 },
        (error, token) => {
          if (error) throw error;
          res.json(token);
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
