const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  interests: [{
    type: String
  }],
  region: {
    type: String,
    default: 'Global'
  },
  subscribedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  featureVector: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
