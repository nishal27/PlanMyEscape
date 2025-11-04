const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  budget: {
    type: Number,
    default: 0
  },
  travelers: {
    type: Number,
    default: 1
  },
  preferences: {
    type: Map,
    of: String
  },
  activities: [{
    date: Date,
    time: String,
    activity: String,
    description: String,
    location: {
      name: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    cost: Number,
    duration: Number // in minutes
  }],
  accommodations: [{
    name: String,
    checkIn: Date,
    checkOut: Date,
    location: {
      name: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    cost: Number,
    bookingReference: String
  }],
  flights: [{
    departure: {
      airport: String,
      dateTime: Date,
      flightNumber: String
    },
    arrival: {
      airport: String,
      dateTime: Date
    },
    cost: Number,
    bookingReference: String
  }],
  status: {
    type: String,
    enum: ['draft', 'generated', 'confirmed', 'completed'],
    default: 'draft',
    index: true
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
itinerarySchema.index({ userId: 1, createdAt: -1 });
itinerarySchema.index({ destination: 1, startDate: 1 });
itinerarySchema.index({ status: 1, userId: 1 });
itinerarySchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);

