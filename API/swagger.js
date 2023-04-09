const swaggerAutogen = require('swagger-autogen');
const fs = require('fs');

const outputFile = './swagger.json';
const routesFolder = './routes';

const initSwagger = (options) => {
  fs.readdir(routesFolder, (err, files) => {
    if (err) {
      console.error('Error accessing routes for swagger generation', err);
      throw err;
    }
    const endpointsFiles = files
      .filter(f => f !== 'index.js')
      .map(f => `${routesFolder}/${f}`);
    swaggerAutogen(outputFile, endpointsFiles, options);
  });
}

module.exports = {
  initSwagger
};