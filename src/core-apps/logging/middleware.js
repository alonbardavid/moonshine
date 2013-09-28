var lograp = require("lograp"),
    winston = require("winston")
var moonshine = require("../../")
var settings = moonshine.settings

module.exports.before = function(cb){
    try {
        lograp.rootPath = settings.LOGGING_ROOT_PATH;
        winston.remove(winston.transports.Console)
        winston.addColors(settings.LOGGING_WINSTON_COLOR)
        winston.add(winston.transports.Console,{
            level:settings.LOGGING_LOG_LEVEL,
            handleExceptions: true,
            colorize: true
        })
        moonshine.logFactory = lograp
        lograp().debug("logging initialized")
        cb()
    } catch (err) {
        cb(err)
    }
}
