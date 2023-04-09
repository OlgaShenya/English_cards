const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const logger = require("./logger").app;
const { initSwagger } = require('./swagger');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger.json');

// !Important
// Load the env variables with dotenv before starting to work with the config files!
dotenv.config({
  path: path.resolve(__dirname, process.env.NODE_ENV + '.env')
});

const db = require("./db/db");
const { mountRoutes } = require('./routes/index');
const { server: config } = require("./config/server");
const { signature } = require("./config/jwt");

const appDir = path.dirname(require.main.filename);

const swaggerOptions = {
  basePath: config.apiPrefix,
  host: `${config.host}:${config.port}`,
};

const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();

router.use((request, response, next) => {
  if (request.path === config.pingUrl || request.path.startsWith(config.swaggerUrl)) {
    next();
  }
  else if (['/users', '/auth'].includes(request.path) && request.method === 'POST') {
    next();
  }
  else {
    if (!request.headers.authorization) {
      response.status(403).json({ error: "not authorized" });
      return;
    }
    try {
      request.user = jwt.verify(request.headers.authorization, signature);
      next();
    } catch (error) {
      logger.debug(error);
      response.status(403).json({ error: "Access denied" });
    }    
  }
});

// enable swagger only for dev mode
if (process.env.NODE_ENV !== 'production') {
  // autogenerate swagger definitions from the API routes
  initSwagger(swaggerOptions);

  // add swagger service to the router
  router.use(config.swaggerUrl, swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

mountRoutes(router);
app.use(config.apiPrefix, router);

app.listen(config.port, config.host,
  () => {
    console.log(`Test the server: http://${config.host}:${config.port}${config.apiPrefix}${config.pingUrl}`);
    console.log(`See API docs: http://${config.host}:${config.port}${config.apiPrefix}${config.swaggerUrl}`);
  });
