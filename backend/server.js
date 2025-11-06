require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./utils/logger');
const app = require('./app');

var server;

async function connect() {
  await mongoose.connect(config.mongo.uri, config.mongo.options);
  logger.info('Connected to MongoDB', { uri: config.mongo.uri });
}

async function bootstrap() {
  try {
    await connect();
    server = http.createServer(app);
    server.listen(config.app.port, function () {
      logger.info('API listening on port ' + config.app.port, { env: config.app.env });
    });
  } catch (err) {
    logger.error('Failed to start server', { message: err.message });
    process.exit(1);
  }
}

bootstrap();

process.on('SIGINT', function () {
  logger.info('Shutting down');
  Promise.resolve().then(function () {
    if (server) server.close();
    return mongoose.disconnect();
  }).finally(function () {
    process.exit(0);
  });
});

process.on('unhandledRejection', function (reason) {
  logger.error('Unhandled rejection', { message: reason && reason.message ? reason.message : reason });
});
