const logger = require("./logger").app;
const db = require("./db/db");

(async () => {
  logger.debug(await db.GetList("ds"));
  //   logger.debug(await db.GetLists(1));
})();
