const addPongRoutes = (router) => {
  router.route('/pong')
    .get((_request, response) => {
      response.json({ message: `Card Application is Working ${new Date()} - PONG (AUTHORIZED)` });
    });
}

module.exports = addPongRoutes;