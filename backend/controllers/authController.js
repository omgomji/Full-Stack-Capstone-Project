const Joi = require('joi');
const createHttpError = require('http-errors');
const User = require('../models/User');
const tokenService = require('../services/tokenService');
const config = require('../config');

var loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

async function login(req, res, next) {
  try {
    var payload = loginSchema.validate(req.body, { abortEarly: false });
    if (payload.error) {
      return next(createHttpError(400, payload.error.message));
    }
    var user = await User.findOne({ email: payload.value.email });
    if (!user) return next(createHttpError(401, 'Invalid credentials'));
    var valid = await user.verifyPassword(payload.value.password);
    if (!valid) return next(createHttpError(401, 'Invalid credentials'));

    user.clearExpiredRefreshTokens();
    var refreshToken = tokenService.generateRefreshToken(user);
    var decoded = tokenService.verifyRefresh(refreshToken);
    var hashed = tokenService.hash(refreshToken);
    user.refreshTokens.push({ token: hashed, expiresAt: new Date(decoded.exp * 1000) });
    await user.save();

    var accessToken = tokenService.generateAccessToken(user);
    res.cookie(config.auth.cookieName, refreshToken, config.auth.cookieOptions);
    res.json({
      accessToken: accessToken,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    var cookieToken = req.cookies ? req.cookies[config.auth.cookieName] : undefined;
    if (!cookieToken) return next(createHttpError(401, 'Refresh token missing'));
    var decoded = tokenService.verifyRefresh(cookieToken);
    var user = await User.findById(decoded.sub);
    if (!user) return next(createHttpError(401, 'User not found'));
    user.clearExpiredRefreshTokens();
    var hashed = tokenService.hash(cookieToken);
    var stored = user.refreshTokens.find(function (entry) { return entry.token === hashed; });
    if (!stored) return next(createHttpError(401, 'Refresh token invalidated'));

    user.refreshTokens = user.refreshTokens.filter(function (entry) {
      return entry.token !== hashed;
    });

    var newRefreshToken = tokenService.generateRefreshToken(user);
    var newDecoded = tokenService.verifyRefresh(newRefreshToken);
    user.refreshTokens.push({ token: tokenService.hash(newRefreshToken), expiresAt: new Date(newDecoded.exp * 1000) });
    await user.save();

    var accessToken = tokenService.generateAccessToken(user);
    res.cookie(config.auth.cookieName, newRefreshToken, config.auth.cookieOptions);
    res.json({
      accessToken: accessToken,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(createHttpError(401, err.message));
  }
}

async function logout(req, res, next) {
  try {
    var cookieToken = req.cookies ? req.cookies[config.auth.cookieName] : undefined;
    if (cookieToken && req.user) {
      var user = await User.findById(req.user.sub);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(function (entry) {
          return entry.token !== tokenService.hash(cookieToken);
        });
        await user.save();
      }
    }
    res.clearCookie(config.auth.cookieName, config.auth.cookieOptions);
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  login: login,
  refresh: refresh,
  logout: logout,
  me: me
};
