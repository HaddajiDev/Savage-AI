const mongoose = require('mongoose');

const PendingUser = new mongoose.Schema({
    email: {
        type: String,
    },
    token: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
      }
})

module.exports = mongoose.model("pending", PendingUser);