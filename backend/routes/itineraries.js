const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const Itinerary = require('../models/Itinerary');
const { authenticateJWT } = require('../middleware/auth');

// Get all itineraries for user
router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const { status, destination } = req.query;
    const query = { userId: req.user._id };
    
    if (status) query.status = status;
    if (destination) query.destination = new RegExp(destination, 'i');

    const itineraries = await Itinerary.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 20);

    res.json({ itineraries });
  } catch (error) {
    next(error);
  }
});

// Get single itinerary
router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json({ itinerary });
  } catch (error) {
    next(error);
  }
});

// Create itinerary
router.post('/', authenticateJWT, [
  body('title').trim().notEmpty(),
  body('destination').trim().notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('budget').optional().isNumeric()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const itinerary = new Itinerary({
      ...req.body,
      userId: req.user._id
    });

    await itinerary.save();
    res.status(201).json({ itinerary });
  } catch (error) {
    next(error);
  }
});

// Generate AI itinerary
router.post('/:id/generate', authenticateJWT, async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Call AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiServiceUrl}/generate-itinerary`, {
      destination: itinerary.destination,
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      budget: itinerary.budget,
      travelers: itinerary.travelers,
      preferences: itinerary.preferences,
      userPreferences: req.user.preferences
    });

    // Update itinerary with AI-generated content
    itinerary.activities = response.data.activities || [];
    itinerary.accommodations = response.data.accommodations || [];
    itinerary.status = 'generated';
    itinerary.aiGenerated = true;
    await itinerary.save();

    res.json({ itinerary });
  } catch (error) {
    console.error('AI service error:', error.message);
    next(error);
  }
});

// Update itinerary
router.put('/:id', authenticateJWT, [
  body('title').optional().trim().notEmpty(),
  body('destination').optional().trim().notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json({ itinerary });
  } catch (error) {
    next(error);
  }
});

// Delete itinerary
router.delete('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

