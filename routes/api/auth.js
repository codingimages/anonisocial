const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// protect the route using token
const auth = require('../../middleware/auth');

// @route   GET api/auth
// @desc    Auth route
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    // select user id as defined in /api/users file but removing the password
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth
// @desc    Authenticate user && get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Email is required').not().isEmpty(),
    check('password', 'Password is required').exists(),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // see if user does not exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

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
