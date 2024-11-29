const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['rally', 'meeting', 'training', 'door_to_door', 'phone_banking', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    address: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    }
  }],
  maxParticipants: {
    type: Number,
    required: true
  },
  materials: [{
    name: String,
    url: String,
    type: String
  }],
  points: {
    type: Number,
    default: 20
  },
  status: {
    type: String,
    enum: ['planned', 'ongoing', 'completed', 'cancelled'],
    default: 'planned'
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District'
  },
  feedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  notifications: {
    reminderSent: {
      type: Boolean,
      default: false
    },
    feedbackRequestSent: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a 2dsphere index for location-based queries
eventSchema.index({ 'location.coordinates': '2dsphere' });

// Calculate average rating
eventSchema.methods.getAverageRating = function() {
  if (this.feedback.length === 0) return 0;
  
  const sum = this.feedback.reduce((acc, curr) => acc + curr.rating, 0);
  return sum / this.feedback.length;
};

// Check if event is full
eventSchema.methods.isFull = function() {
  return this.participants.filter(p => p.status === 'registered').length >= this.maxParticipants;
};

// Update the updatedAt timestamp before saving
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Event', eventSchema);
