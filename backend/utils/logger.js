var util = require('util');

function format(level, message, meta) {
  var timestamp = new Date().toISOString();
  var base = '[' + timestamp + '] [' + level + '] ' + message;
  if (meta && Object.keys(meta).length > 0) {
    base += ' ' + JSON.stringify(meta);
  }
  return base;
}

function log(level, message, meta) {
  if (level === 'ERROR' || level === 'WARN') {
    console.error(format(level, message, meta));
  } else {
    console.log(format(level, message, meta));
  }
}

module.exports = {
  info: function (message, meta) { log('INFO', message, meta || {}); },
  warn: function (message, meta) { log('WARN', message, meta || {}); },
  error: function (message, meta) { log('ERROR', message, meta || {}); }
};
