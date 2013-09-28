var moonshine = require("../../")
var settings = moonshine.settings
var logger = moonshine.logFactory()
var baucis = require("baucis")

module.exports.before = function setupApi(cb){

    moonshine.api = {
        resources:{},
        createResource: function(name,options){
            var resource = baucis.rest(options);
            moonshine.api.resources[name] = resource
            return resource;
        },
        native: baucis
    }
    cb()
}
module.exports.process = moonshine.helpers.middleware.genericLoadAppFunction("api",logger);

module.exports.after = function addApiToServer(cb){
    try {
        moonshine.server.app.use(settings.API_ROOT_PATH,baucis({version:'0.0.1'}))
        cb()
    } catch (err) {
        cb(err)
    }
}
