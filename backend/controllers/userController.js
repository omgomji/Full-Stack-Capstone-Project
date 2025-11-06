const Joi = require('joi');
const createHttpError = require('http-errors');
const User = require('../models/User');
const permissions = require('../config/permissions');
const auditService = require('../services/auditService');

function roleEnum() {
  var base = Joi.string();
  return base.valid.apply(base, permissions.roles);
}

var createSchema = Joi.object({
  name: Joi.string().min(2).max(64).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: roleEnum().required()
});

var updateRoleSchema = Joi.object({
  role: roleEnum().required()
});

async function list(req, res, next) {
  try {
    var filter = {};
    if (req.query.role) filter.role = req.query.role;
    var users = await User.find(filter).select('name email role createdAt updatedAt').lean();
    res.json({ users: users });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    var payload = createSchema.validate(req.body, { abortEarly: false });
    if (payload.error) return next(createHttpError(400, payload.error.message));
    var existing = await User.findOne({ email: payload.value.email });
    if (existing) return next(createHttpError(409, 'Email already exists'));
    var user = new User({
      name: payload.value.name,
      email: payload.value.email,
      role: payload.value.role
    });
    await user.setPassword(payload.value.password);
    await user.save();
    await auditService.record(req, 'users:create', 'User', user._id, {
      name: user.name,
      email: user.email,
      role: user.role
    });
    res.status(201).json({
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

async function updateRole(req, res, next) {
  try {
    var payload = updateRoleSchema.validate(req.body);
    if (payload.error) return next(createHttpError(400, payload.error.message));
    var user = await User.findById(req.params.id);
    if (!user) return next(createHttpError(404, 'User not found'));
    var beforeRole = user.role;
    user.role = payload.value.role;
    await user.save();
    await auditService.record(req, 'users:assign-role', 'User', user._id, {
      previousRole: beforeRole,
      newRole: user.role
    });
    res.json({
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

async function remove(req, res, next) {
  try {
    var user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(createHttpError(404, 'User not found'));
    await auditService.record(req, 'users:delete', 'User', user._id, {
      name: user.name,
      email: user.email
    });
    res.json({ message: 'User removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list: list,
  create: create,
  updateRole: updateRole,
  remove: remove
};
