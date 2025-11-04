const express = require('express');
const router = express.Router();
const axios = require('axios');
const Booking = require('../models/Booking');
const { authenticateJWT } = require('../middleware/auth');

// Amadeus API helper
const getAmadeusToken = async () => {
  try {
    const response = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', 
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data.access_token;
  } catch (error) {
    throw new Error('Failed to get Amadeus token');
  }
};

// Get all bookings
router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const query = { userId: req.user._id };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .sort({ bookingDate: -1 })
      .limit(parseInt(req.query.limit) || 20);

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

// Search flights
router.post('/flights/search', authenticateJWT, async (req, res, next) => {
  try {
    const { origin, destination, departureDate, returnDate, passengers } = req.body;
    
    const token = await getAmadeusToken();
    const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        returnDate,
        adults: passengers || 1,
        currencyCode: 'USD',
        max: 10
      }
    });

    res.json({ flights: response.data.data });
  } catch (error) {
    console.error('Amadeus API error:', error.response?.data || error.message);
    next(error);
  }
});

// Search hotels
router.post('/hotels/search', authenticateJWT, async (req, res, next) => {
  try {
    const { cityCode, checkInDate, checkOutDate, guests } = req.body;
    
    const token = await getAmadeusToken();
    
    // First, get hotel IDs by city
    const hotelListResponse = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city', {
      headers: { Authorization: `Bearer ${token}` },
      params: { cityCode }
    });

    const hotelIds = hotelListResponse.data.data.slice(0, 10).map(h => h.hotelId).join(',');

    // Then get hotel offers
    const offersResponse = await axios.get('https://test.api.amadeus.com/v3/shopping/hotel-offers', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        hotelIds,
        checkInDate,
        checkOutDate,
        adults: guests || 1
      }
    });

    res.json({ hotels: offersResponse.data.data });
  } catch (error) {
    console.error('Amadeus API error:', error.response?.data || error.message);
    next(error);
  }
});

// Create booking
router.post('/', authenticateJWT, async (req, res, next) => {
  try {
    const { type, itineraryId, bookingReference, details, cost, travelDate } = req.body;

    const booking = new Booking({
      userId: req.user._id,
      itineraryId,
      type,
      bookingReference: bookingReference || `BK${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      details,
      cost,
      travelDate,
      status: 'confirmed'
    });

    await booking.save();
    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
});

// Update booking status
router.put('/:id/status', authenticateJWT, async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { status } },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

// Get booking details
router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

