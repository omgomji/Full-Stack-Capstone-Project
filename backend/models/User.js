const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const permissions = require('../config/permissions');

var refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true }
}, { _id: false });

var userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: permissions.roles, default: 'viewer' },
  refreshTokens: [refreshTokenSchema]
}, { timestamps: true });

userSchema.methods.setPassword = async function (password) {
  var hash = await bcrypt.hash(password, 10);
  this.passwordHash = hash;
};

userSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.clearExpiredRefreshTokens = function () {
  var now = new Date();
  this.refreshTokens = this.refreshTokens.filter(function (entry) {
    return entry.expiresAt > now;
  });
};

module.exports = mongoose.model('User', userSchema);
