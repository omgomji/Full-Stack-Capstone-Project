process.env.JWT_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.ACCESS_TOKEN_TTL = '1h';
process.env.REFRESH_TOKEN_TTL = '7d';

const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Post = require('../models/Post');
const permissionMetrics = require('../middleware/permission').metrics;

var mongo;

async function seed() {
  var admin = new User({ name: 'Admin', email: 'admin@test.com', role: 'admin' });
  await admin.setPassword('secret123');
  await admin.save();

  var editor = new User({ name: 'Editor', email: 'editor@test.com', role: 'editor' });
  await editor.setPassword('secret123');
  await editor.save();

  var viewer = new User({ name: 'Viewer', email: 'viewer@test.com', role: 'viewer' });
  await viewer.setPassword('secret123');
  await viewer.save();

  await Post.create({
    title: 'Editor Draft',
    content: 'Editor private draft',
    status: 'draft',
    authorId: editor._id,
    lastModifiedBy: editor._id
  });

  await Post.create({
    title: 'Admin Post',
    content: 'Admin published post',
    status: 'published',
    authorId: admin._id,
    lastModifiedBy: admin._id,
    publishedAt: new Date()
  });

  return { admin: admin, editor: editor, viewer: viewer };
}

async function login(email, password) {
  var res = await request(app).post('/api/auth/login').send({ email: email, password: password });
  return res.body.accessToken;
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await seed();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test('editor can update own post but not admin post', async () => {
  var editorToken = await login('editor@test.com', 'secret123');
  var postsRes = await request(app).get('/api/posts').set('Authorization', 'Bearer ' + editorToken);
  expect(postsRes.status).toBe(200);
  var postId = postsRes.body.posts[0]._id;
  var updateOwn = await request(app)
    .put('/api/posts/' + postId)
    .set('Authorization', 'Bearer ' + editorToken)
    .send({ title: 'Updated', content: 'Updated content', status: 'draft' });
  expect(updateOwn.status).toBe(200);

  var adminPost = await Post.findOne({ title: 'Admin Post' });
  var updateOther = await request(app)
    .put('/api/posts/' + adminPost._id)
    .set('Authorization', 'Bearer ' + editorToken)
    .send({ title: 'Hack', content: 'Attempt', status: 'draft' });
  expect(updateOther.status).toBe(403);
});

test('viewer denied when creating posts', async () => {
  var viewerToken = await login('viewer@test.com', 'secret123');
  var res = await request(app)
    .post('/api/posts')
    .set('Authorization', 'Bearer ' + viewerToken)
    .send({ title: 'Nope', content: 'Viewers cannot create', status: 'draft' });
  expect(res.status).toBe(403);
});

test('admin can list users while editor receives 403', async () => {
  var adminToken = await login('admin@test.com', 'secret123');
  var list = await request(app).get('/api/users').set('Authorization', 'Bearer ' + adminToken);
  expect(list.status).toBe(200);
  expect(Array.isArray(list.body.users)).toBe(true);

  var editorToken = await login('editor@test.com', 'secret123');
  var denied = await request(app).get('/api/users').set('Authorization', 'Bearer ' + editorToken);
  expect(denied.status).toBe(403);
});

test('permission metrics track denials', async () => {
  var before = permissionMetrics.totalDenials;
  var viewerToken = await login('viewer@test.com', 'secret123');
  await request(app)
    .post('/api/posts')
    .set('Authorization', 'Bearer ' + viewerToken)
    .send({ title: 'Denied', content: 'Denied', status: 'draft' });
  expect(permissionMetrics.totalDenials).toBeGreaterThan(before);
});
