const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  boundaries: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of arrays of numbers
      required: true
    }
  },
  population: {
    type: Number,
    required: true
  },
  assignedVolunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  visitedHouseholds: [{
    address: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    visitDate: Date,
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    feedback: String,
    followUp: Boolean,
    contactPerson: String
  }],
  statistics: {
    totalHouseholds: Number,
    visitedHouseholds: {
      type: Number,
      default: 0
    },
    positiveResponses: {
      type: Number,
      default: 0
    },
    followUpNeeded: {
      type: Number,
      default: 0
    }
  },
  notes: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
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
districtSchema.index({ 'boundaries': '2dsphere' });
districtSchema.index({ 'visitedHouseholds.location': '2dsphere' });

// Update statistics when a household is visited
districtSchema.methods.updateStatistics = function() {
  this.statistics.visitedHouseholds = this.visitedHouseholds.length;
  this.statistics.positiveResponses = this.visitedHouseholds.filter(h => h.feedback === 'positive').length;
  this.statistics.followUpNeeded = this.visitedHouseholds.filter(h => h.followUp).length;
};

// Update the updatedAt timestamp before saving
districtSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('District', districtSchema);
