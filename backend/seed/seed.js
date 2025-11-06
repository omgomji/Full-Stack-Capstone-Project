require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../utils/logger');
const User = require('../models/User');
const Post = require('../models/Post');

var seedUsers = [
  { name: 'Alice Admin', email: 'admin@example.com', role: 'admin', password: 'AdminPass123!' },
  { name: 'Eddie Editor', email: 'editor@example.com', role: 'editor', password: 'EditorPass123!' },
  { name: 'Violet Viewer', email: 'viewer@example.com', role: 'viewer', password: 'ViewerPass123!' }
];

async function ensureUsers() {
  var results = [];
  for (var i = 0; i < seedUsers.length; i++) {
    var data = seedUsers[i];
    var existing = await User.findOne({ email: data.email });
    if (existing) {
      logger.info('User exists, skipping', { email: data.email });
      results.push(existing);
      continue;
    }
    var user = new User({ name: data.name, email: data.email, role: data.role });
    await user.setPassword(data.password);
    await user.save();
    logger.info('Created user', { email: user.email, role: user.role });
    results.push(user);
  }
  return results;
}

async function ensurePosts(users) {
  var admin = users.find(function (u) { return u.role === 'admin'; });
  var editor = users.find(function (u) { return u.role === 'editor'; });
  var viewer = users.find(function (u) { return u.role === 'viewer'; });
  if (!admin || !editor || !viewer) return;
  var count = await Post.countDocuments();
  if (count > 0) {
    logger.info('Posts already present, skipping seed');
    return;
  }
  await Post.insertMany([
    {
      title: 'Admin Handbook',
      content: 'Administrative overview of the RBAC system.',
      status: 'published',
      authorId: admin._id,
      lastModifiedBy: admin._id,
      publishedAt: new Date()
    },
    {
      title: 'Editor Guide',
      content: 'Editors can manage their own posts in this system.',
      status: 'draft',
      authorId: editor._id,
      lastModifiedBy: editor._id
    },
    {
      title: 'Viewer Welcome',
      content: 'Viewers have read-only access to published content.',
      status: 'published',
      authorId: admin._id,
      lastModifiedBy: admin._id,
      publishedAt: new Date()
    }
  ]);
  logger.info('Seeded posts');
}

async function run() {
  await mongoose.connect(config.mongo.uri, config.mongo.options);
  logger.info('Connected to Mongo for seeding');
  var users = await ensureUsers();
  await ensurePosts(users);
  await mongoose.disconnect();
  logger.info('Seeding complete');
}

run().catch(function (err) {
  logger.error('Seed failed', { message: err.message });
  process.exit(1);
});
