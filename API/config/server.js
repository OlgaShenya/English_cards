const server = {
  host: process.env.HOST,
  port: +process.env.PORT,
  apiPrefix: process.env.API_PREFIX,
  pingUrl: process.env.PING_URL,
  swaggerUrl: process.env.SWAGGER_URL,
};

module.exports = {
  server
}