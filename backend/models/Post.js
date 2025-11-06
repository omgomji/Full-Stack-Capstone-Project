const mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  publishedAt: { type: Date }
}, { timestamps: true });

postSchema.index({ authorId: 1, status: 1 });
postSchema.index({ status: 1, updatedAt: -1 });

module.exports = mongoose.model('Post', postSchema);
