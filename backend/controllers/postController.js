const Joi = require('joi');
const createHttpError = require('http-errors');
const Post = require('../models/Post');
const auditService = require('../services/auditService');

var postSchema = Joi.object({
  title: Joi.string().min(3).max(180).required(),
  content: Joi.string().min(10).required(),
  status: Joi.string().valid('draft', 'published').optional(),
  authorId: Joi.string().optional()
});

async function list(req, res, next) {
  try {
    var role = req.user.role;
    var userId = req.user.sub;
    var filter = {};
    if (role === 'editor') {
      filter.authorId = userId;
    }
    if (role === 'viewer') {
      filter.status = 'published';
    }
    var posts = await Post.find(filter).sort({ updatedAt: -1 }).lean();
    res.json({ posts: posts });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    var post = await Post.findById(req.params.id).lean();
    if (!post) return next(createHttpError(404, 'Post not found'));
    if (req.user.role === 'viewer' && post.status !== 'published') {
      return next(createHttpError(403, 'Post restricted'));
    }
    if (req.permissionScope === 'own' && req.user.role === 'editor' && String(post.authorId) !== req.user.sub) {
      return next(createHttpError(403, 'Forbidden'));
    }
    res.json({ post: post });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    var payload = postSchema.validate(req.body, { abortEarly: false });
    if (payload.error) return next(createHttpError(400, payload.error.message));
    var data = payload.value;
    var authorId = data.authorId;
    if (!authorId || req.permissionScope === 'own' || req.user.role !== 'admin') {
      authorId = req.user.sub;
    }
    var post = await Post.create({
      title: data.title,
      content: data.content,
      status: data.status || 'draft',
      authorId: authorId,
      lastModifiedBy: req.user.sub,
      publishedAt: data.status === 'published' ? new Date() : undefined
    });
    await auditService.record(req, 'posts:create', 'Post', post._id, {
      title: post.title,
      status: post.status,
      authorId: post.authorId
    });
    res.status(201).json({ post: post });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    var payload = postSchema.validate(req.body, { abortEarly: false });
    if (payload.error) return next(createHttpError(400, payload.error.message));
    var post = await Post.findById(req.params.id);
    if (!post) return next(createHttpError(404, 'Post not found'));
    if (req.permissionScope === 'own' && String(post.authorId) !== req.user.sub) {
      return next(createHttpError(403, 'Cannot modify post owned by another user'));
    }
    var previousStatus = post.status;
    post.title = payload.value.title;
    post.content = payload.value.content;
    if (payload.value.status) {
      post.status = payload.value.status;
    }
    post.lastModifiedBy = req.user.sub;
    if (previousStatus !== 'published' && post.status === 'published') {
      post.publishedAt = new Date();
    }
    await post.save();
    await auditService.record(req, 'posts:update', 'Post', post._id, {
      title: post.title,
      status: post.status
    });
    res.json({ post: post });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    var post = await Post.findById(req.params.id);
    if (!post) return next(createHttpError(404, 'Post not found'));
    if (req.permissionScope === 'own' && String(post.authorId) !== req.user.sub) {
      return next(createHttpError(403, 'Cannot delete post owned by another user'));
    }
    await Post.deleteOne({ _id: post._id });
    await auditService.record(req, 'posts:delete', 'Post', post._id, {
      title: post.title
    });
    res.json({ message: 'Post removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list: list,
  getById: getById,
  create: create,
  update: update,
  remove: remove
};
