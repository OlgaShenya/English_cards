const logger = require("log4js");
logger.configure({
    appenders: {
        out_console: {
            type: "console"
        },
        out_file: {
            type: "file",
            filename: "logs/logs.log"
        }
    },
    categories: {
        default: {
            appenders: ["out_console"],
            level: "all"
        },
        app: {
            appenders: ["out_console", "out_file"],
            level: "all",
        },
        sql: {
            appenders: ["out_file"],
            level: "all",
        }
    }
});

module.exports.app = logger.getLogger("app");
module.exports.sql = logger.getLogger("sql");
