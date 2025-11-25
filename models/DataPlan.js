const mongoose = require('mongoose');

const dataPlanSchema = new mongoose.Schema({
  planId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  plan: {
    type: String,
    required: true,
    trim: true
  },
  network: {
    type: String,
    required: true,
    enum: ['MTN', 'AIRTEL', '9MOBILE', 'GLO'],
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['SME', 'Corporate', 'Gifting'],
    index: true
  },
  size: {
    type: String,
    required: true
  },
  validity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
dataPlanSchema.index({ network: 1, type: 1 });
dataPlanSchema.index({ network: 1, isActive: 1 });
dataPlanSchema.index({ isActive: 1, price: 1 });

// Static methods
dataPlanSchema.statics.findByNetwork = function(network) {
  return this.find({ network: network.toUpperCase(), isActive: true });
};

dataPlanSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

dataPlanSchema.statics.findByNetworkAndType = function(network, type) {
  return this.find({ 
    network: network.toUpperCase(), 
    type, 
    isActive: true 
  });
};

const DataPlan = mongoose.model('DataPlan', dataPlanSchema);

module.exports = DataPlan;