const addPingRoutes = require('./ping');
const addPongRoutes = require('./pong');
const addListRoutes = require('./list');
const addWordRoutes = require('./word');
const addUserRoutes = require('./user');

const mountRoutes = (router) => {
  addPingRoutes(router);
  addPongRoutes(router);
  addListRoutes(router);
  addWordRoutes(router);
  addUserRoutes(router);
}

module.exports = {
  mountRoutes
};