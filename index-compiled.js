'use strict';

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _hapi = require('hapi');

var _hapi2 = _interopRequireDefault(_hapi);

var _inert = require('inert');

var _inert2 = _interopRequireDefault(_inert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var server = new _hapi2.default.Server();

server.connection({
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
