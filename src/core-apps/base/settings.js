var path = require("path")
module.exports.config = function(settings){
    settings.ROOT_PATH = require.main?path.dirname(require.main.filename):process.cwd()

    settings.middleware = []
}