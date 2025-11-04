const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateJWT } = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticateJWT, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticateJWT, [
  body('name').optional().trim().notEmpty(),
  body('preferences.budget').optional().isNumeric(),
  body('preferences.travelStyle').optional().isIn(['budget', 'mid-range', 'luxury', 'backpacker'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

