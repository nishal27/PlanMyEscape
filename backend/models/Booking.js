const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  itineraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Itinerary',
    index: true
  },
  type: {
    type: String,
    enum: ['flight', 'hotel', 'activity', 'transport'],
    required: true,
    index: true
  },
  provider: {
    type: String,
    default: 'amadeus'
  },
  bookingReference: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
    index: true
  },
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  cost: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  bookingDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  travelDate: {
    type: Date,
    index: true
  },
  cancellationPolicy: {
    type: String
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

// Compound indexes for optimized queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ userId: 1, bookingDate: -1 });
bookingSchema.index({ itineraryId: 1, type: 1 });
bookingSchema.index({ bookingReference: 1 }, { unique: true });
bookingSchema.index({ travelDate: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

