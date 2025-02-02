const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    role: String,
    content: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);