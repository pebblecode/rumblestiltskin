import * as _ from 'lodash';
import Path from 'path';
import Hapi from 'hapi';
import inert from 'inert';
import r from 'rethinkdb';

const dbConnect = (cb) => {
  r.connect({ 
    host: 'localhost', port: 28015
  }, function(err, conn) {
    if (err) throw err;
    console.log('connected to db')
    cb(conn);
  });
};

const dbDisconnect = (conn) => {
  conn.close();
  console.log('disconnected from db');
};

try {
  dbConnect(conn => {
    r.tableCreate('phoneEvents').run(conn, function(err, result) {
      r.table('phoneEvents')
        .indexCreate('time')
        .run(conn, () => {
          dbDisconnect(conn);
        })
    })
  })
} catch (e) {
  console.log('Assuming table already exists');
}


const newEvent = (event) => {
  event.time = new Date().getTime();
  dbConnect(conn => {
    r.table('phoneEvents')
      .insert([event])
      .run(conn, function(err, result) {
        if (err) throw err;
        dbDisconnect(conn);
      })
  })
};

const getEvents = (cb) => {
  dbConnect(conn => {
    r.table('phoneEvents')
      .orderBy({ index: r.desc('time') })
      .limit(20)
      .run(conn, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
          if (err) throw err;
          cb(result);
        });
      });
  })
};


const server = new Hapi.Server();

server.connection({
  host: '0.0.0.0',
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
    method: 'POST',
    path: '/event',
    handler: function (request, reply) {
      newEvent(request.payload);
      reply(200);
    }
  });

  server.route({
    method: 'GET',
    path: '/events',
    handler: function (request, reply) {
      getEvents(evs => {
        reply(JSON.stringify(evs));
      });
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
