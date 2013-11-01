var DepTree = require("./dep-tree"),
    configProcessor = require("./configuration-processor"),
    MiddlwareLoader = require("./middleware-loader"),
    async = require("async")

function AppLoader(logger,middlewareFunctionNames){
    this.depTree = null
    this.settings = {}
    this.logger = logger;
    this.mfn = middlewareFunctionNames || {}
    this.mfn.pre = this.mfn.pre || "pre"
    this.mfn.before = this.mfn.before || "before"
    this.mfn.process = this.mfn.process || "process"
    this.mfn.after = this.mfn.after || "after"
    this.mfn.post = this.mfn.post || "post"
    this.mfn.shutdown = this.mfn.shutdown || "shutdown"
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

AppLoader.prototype.start = function(rootApp) {
	var apps = Array.prototype.slice.call(arguments,1)
	var cb = null;
	var lastArgument = arguments[arguments.length - 1]
	if (typeof lastArgument == "function") {
		cb = lastArgument
		apps = apps.slice(0, -1)
	}
    this.depTree = finalizeDepTree(rootApp,apps);
    this.loadSettings(
        function(err){
            this.afterLoadSettings(err,cb)
        }) //cb
}
AppLoader.prototype.stop = function(cb){
    this.middlewareLoader.applyMiddlewareFunction(this.mfn.shutdown)(cb)
}
AppLoader.prototype.afterLoadSettings = function(err,cb) {
    if (!this.settings.middleware) return; //no middlewares to run
    var self = this;
    if (err) return this.handleError(err)
    var middlewareLoader = this.middlewareLoader =new MiddlwareLoader(this.settings.middleware,this.depTree,this.logger)
    async.series(
        [
            middlewareLoader.applyMiddlewareFunction(this.mfn.pre),
            middlewareLoader.applyMiddlewareProcessor(this.mfn.before,this.mfn.process,this.mfn.after),
            middlewareLoader.applyMiddlewareFunction(this.mfn.post)
        ]
        ,function(err){
            self.handleError(err)
            if (cb) cb(err)
        })
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
        cb.call(self,err)
    })
}
function finalizeDepTree(rootApp,additionalApps) {
    var depTree = DepTree.loadTree({root:rootApp})
    additionalApps.reverse().forEach(function(app){
        depTree.addDependency(app,true)
        depTree.addDependencies(app,true);
    })
    return depTree;
}

module.exports = AppLoader