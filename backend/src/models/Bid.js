
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  bidNumber: {
    type: String,
    unique: true
  },
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorName: String,
  vendorCompany: String,
  quotedPrice: {
    type: Number,
    required: [true, 'Quoted price is required']
  },
  deliveryTime: {
    type: Number,
    required: true
  },
  deliveryTimeUnit: {
    type: String,
    enum: ['days', 'weeks', 'months'],
    default: 'days'
  },
  validityPeriod: {
    type: Number,
    default: 30
  },
  comments: String,
  specifications: {
    type: Map,
    of: String
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'],
    default: 'submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

bidSchema.pre('save', function(next) {
  if (!this.bidNumber) {
    this.bidNumber = 'BID' + Date.now() + Math.floor(Math.random() * 1000);
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Bid', bidSchema);
