const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  announcement_header: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  featured_image: {
    data: Buffer,
    contentType: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);