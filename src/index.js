var loggerWrapper = require("./loggerwrapper"),
    AppLoader = require("./foundation/app-loader")

///moonshine is a singleton
if (global.__moonshine_loaded) throw new Error("moonshine has been required twice. moonshine is a singleton and should never be dependent more then once. make sure that you use peerDependencies in npm when depending on moonshine")
global.__moonshine_loaded = true;

var appLoader = new AppLoader(loggerWrapper.logger)

//defines an app- must be called from the index of every app
var defineApp =module.exports.defineApp =function(appModule,options){
    options = options || {}
    options.appsKey = "moonApps"
    return appLoader.defineApp(appModule,options)
}

//this is the main moonshine app. it's mainly used to load
//the core-apps as dependencies using the appLoader mechanism
var moonshineApp = defineApp(module,{package:require("../package")})


module.exports.start = function() {
    loggerWrapper.logger.info("loading moonshine")
    return appLoader.start(moonshineApp)
}

module.exports.helpers = {
    middleware: require("./helpers/middleware-helper")
}
////// service locator
module.exports.service= {}
module.exports.registerService = function(name,service) {
    module.exports.service[name] = service
    module.exports[name] = service
}
module.exports.settings = appLoader.settings;
