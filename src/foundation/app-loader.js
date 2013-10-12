var DepTree = require("./dep-tree"),
    configProcessor = require("./configuration-processor"),
    MiddlwareLoader = require("./middleware-loader"),
    async = require("async")

function AppLoader(logger){
    this.depTree = null
    this.settings = {}
    this.logger = logger;
}
AppLoader.prototype.defineApp =function(appModule,options){
    options = options || {}
    options.appsKey = options.appsKey || "moonApps"
    if(!appModule) throw new Error("when defining an app, you must pass the module instance")
    var dependsOnApps = [];
    try {
        var package = options.package || appModule.require("./package")
        dependsOnApps = package[options.appsKey] || []
    } catch(e) {
        //no package.json
    }
    return DepTree.setupNode(appModule,{apps:dependsOnApps})
}

AppLoader.prototype.start = function() {
    this.depTree = finalizeDepTree(Array.prototype.slice.call(arguments));
    this.loadSettings(this.afterLoadSettings)
}
AppLoader.prototype.afterLoadSettings = function(err) {
    var self = this;
    if (err) return this.handleError(err)
    var middlewareLoader = new MiddlwareLoader(this.settings.middleware,this.depTree,this.logger)
    async.series(
        [
            middlewareLoader.applyMiddlewareFunction("pre"),
            middlewareLoader.applyMiddlewareProcessor("before","process","after"),
            middlewareLoader.applyMiddlewareFunction("post")
        ]
        ,function(err){self.handleError(err)})
}
AppLoader.prototype.handleError = function(err) {
    if (err) {
        this.logger.error("caught error while processing apps",err)
        process.exit()
    }
}
AppLoader.prototype.loadSettings = function(cb){
    this.logger.debug("loading settings")
    var self = this
    this.settings.environment = configProcessor.getEnvironment()
    this.depTree.applyProcessor(function(app,cb){
        configProcessor.loadApp(app,self.settings,cb)
    },function(err){
        cb.apply(self,err)
    })
}
function finalizeDepTree(additionalApps) {
    var rootDir = require.main?require.main.filename:process.cwd()
    var depTree = DepTree.loadTree({root:rootDir})
    additionalApps.forEach(function(app){
        depTree.addDependencies(app,true);
    })
    return depTree;
}

module.exports = AppLoader