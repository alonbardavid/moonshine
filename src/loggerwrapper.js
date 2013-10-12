/*
 a delayed logger, that allows the app-loader to log to console before
 the logging app is initialized, and then logs to winston.
*/
var moonshine = require("./index.js")

var lograpLogger = false
function getLogger() {
    if (!lograpLogger && moonshine.logFactory) {
        lograpLogger = moonshine.logFactory("moonshine.appLoader")
    }
    return lograpLogger;
}

module.exports.logger = {
    debug:function(msg){
        if (getLogger()) return getLogger().debug(msg)
        // don't log debug to console
    },
    info:function(msg){
        if (getLogger()) return getLogger().info(msg)
        console.log(msg)
    },
    error:function(msg,err){
        if (getLogger()) return getLogger().error(msg,err)
        console.log(msg)
        console.log(err.stack)
    }
};

