import * as _ from 'lodash';
import Path from 'path';
import Hapi from 'hapi';
import inert from 'inert';

const server = new Hapi.Server();

server.connection({ 
  port: process.env.PORT || 5000 
});

server.register(inert, (err) => {

  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply.file('public/index.html');
    }
  });

  server.route({
    method: 'GET',
    path: '/{file*}',
    config: {
      handler: {
        directory: {
          path:  'public',
          listing: false
        }
      }
    }
  });

  server.start((err) => {
    if (err) throw err;
    console.log('Server running at:', server.info.uri);
  });

});
