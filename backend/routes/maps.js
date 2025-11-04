const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateJWT } = require('../middleware/auth');

// Get place details
router.get('/place-details', authenticateJWT, async (req, res, next) => {
  try {
    const { placeId } = req.query;

    if (!placeId) {
      return res.status(400).json({ message: 'placeId is required' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        key: process.env.GOOGLE_MAPS_API_KEY,
        fields: 'name,formatted_address,geometry,rating,photos,types,opening_hours'
      }
    });

    res.json({ place: response.data.result });
  } catch (error) {
    console.error('Google Maps API error:', error.response?.data || error.message);
    next(error);
  }
});

// Search places
router.get('/places/search', authenticateJWT, async (req, res, next) => {
  try {
    const { query, location, radius, type } = req.query;

    if (!query && !location) {
      return res.status(400).json({ message: 'Either query or location is required' });
    }

    const params = {
      key: process.env.GOOGLE_MAPS_API_KEY
    };

    if (query) {
      params.query = query;
    }

    if (location) {
      params.location = location;
      params.radius = radius || 5000;
    }

    if (type) {
      params.type = type;
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params
    });

    res.json({ places: response.data.results });
  } catch (error) {
    console.error('Google Maps API error:', error.response?.data || error.message);
    next(error);
  }
});

// Get directions
router.get('/directions', authenticateJWT, async (req, res, next) => {
  try {
    const { origin, destination, mode = 'driving' } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ message: 'origin and destination are required' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin,
        destination,
        mode,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    res.json({ directions: response.data });
  } catch (error) {
    console.error('Google Maps API error:', error.response?.data || error.message);
    next(error);
  }
});

// Geocode address
router.get('/geocode', authenticateJWT, async (req, res, next) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ message: 'address is required' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    res.json({ results: response.data.results });
  } catch (error) {
    console.error('Google Maps API error:', error.response?.data || error.message);
    next(error);
  }
});

module.exports = router;

