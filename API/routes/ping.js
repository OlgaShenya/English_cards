const addPingRoutes = (router) => {
  // not using require("../config/server").server.pingUrl here because otherwise swagger-autogen can't
  // create add the route doc
  router.route('/ping')
    .get((_request, response) => {
      response.json({ message: `Card Application is Working ${new Date()} - PING` });
    });
}

module.exports = addPingRoutes;