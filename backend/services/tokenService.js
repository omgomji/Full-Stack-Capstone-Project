const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

function buildPayload(user) {
  return {
    sub: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name
  };
}

function generateAccessToken(user) {
  return jwt.sign(buildPayload(user), config.auth.jwtSecret, {
    expiresIn: config.auth.accessTokenTtl
  });
}

function generateRefreshToken(user) {
  var token = jwt.sign(buildPayload(user), config.auth.refreshSecret, {
    expiresIn: config.auth.refreshTokenTtl
  });
  return token;
}

function verifyRefresh(token) {
  return jwt.verify(token, config.auth.refreshSecret);
}

function hash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  generateAccessToken: generateAccessToken,
  generateRefreshToken: generateRefreshToken,
  verifyRefresh: verifyRefresh,
  hash: hash
};
