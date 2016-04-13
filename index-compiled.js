'use strict';

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _hapi = require('hapi');

var _hapi2 = _interopRequireDefault(_hapi);

var _inert = require('inert');

var _inert2 = _interopRequireDefault(_inert);

var _rethinkdb = require('rethinkdb');

var _rethinkdb2 = _interopRequireDefault(_rethinkdb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var dbConnect = function dbConnect(cb) {
  _rethinkdb2.default.connect({
    host: 'localhost', port: 28015
  }, function (err, conn) {
    if (err) throw err;
    console.log('connected to db');
    cb(conn);
  });
};

var dbDisconnect = function dbDisconnect(conn) {
  conn.close();
  console.log('disconnected from db');
};

try {
  dbConnect(function (conn) {
    _rethinkdb2.default.tableCreate('phoneEvents').run(conn, function (err, result) {
      _rethinkdb2.default.table('phoneEvents').indexCreate('time').run(conn, function () {
        dbDisconnect(conn);
      });
    });
  });
} catch (e) {
  console.log('Assuming table already exists');
}

var newEvent = function newEvent(event) {
  event.time = new Date().getTime();
  dbConnect(function (conn) {
    _rethinkdb2.default.table('phoneEvents').insert([event]).run(conn, function (err, result) {
      if (err) throw err;
      dbDisconnect(conn);
    });
  });
};

var getEvents = function getEvents(cb) {
  dbConnect(function (conn) {
    _rethinkdb2.default.table('phoneEvents').run(conn, function (err, cursor) {
      if (err) throw err;
      cursor.toArray(function (err, result) {
        if (err) throw err;
        cb(result);
      });
    });
  });
};

var server = new _hapi2.default.Server();

server.connection({
  host: '0.0.0.0',
  port: process.env.PORT || 5000
});

server.register(_inert2.default, function (err) {

  server.route({
    method: 'GET',
    path: '/',
    handler: function handler(request, reply) {
      reply.file('public/index.html');
    }
  });

  server.route({
    method: 'POST',
    path: '/event',
    handler: function handler(request, reply) {
      newEvent(request.payload);
      reply(200);
    }
  });

  server.route({
    method: 'GET',
    path: '/events',
    handler: function handler(request, reply) {
      getEvents(function (evs) {
        reply(evs);
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/chart',
    handler: function handler(request, reply) {
      reply.file('public/chart.html');
    }
  });

  server.route({
    method: 'GET',
    path: '/{file*}',
    config: {
      handler: {
        directory: {
          path: 'public',
          listing: false
        }
      }
    }
  });

  server.start(function (err) {
    if (err) throw err;
    console.log('Server running at:', server.info.uri);
  });
});
