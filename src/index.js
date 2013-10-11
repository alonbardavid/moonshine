if (global.__moonshine_loaded) throw new Error("moonshine has been required twice. moonshine is a singleton and should never be dependent more then once. make sure that you use peerDependencies in npm when depending on moonshine")
global.__moonshine_loaded = true;

var AppTree = require("./foundation/app-tree"),
    path = require("path"),
    configProcessor = require("./foundation/configuration-processor.js"),
    async = require("async")

var foundationApp = AppTree.setupNode(module,{apps:[]})

module.exports.defineApp =function(appModule,options){
    options = options || {}
    if(!appModule) throw new Error("when defining an app, you must pass the module instance")
    var moonApps = [];
    try {
        var package = options.package || appModule.require("./package")
        moonApps = package.moonApps || []
    } catch(e) {
        //no package.json
    }
    return AppTree.setupNode(appModule,{apps:moonApps})
}
var logger = {
    debug:function(){}, // don't log debug to console
    info:function(msg){console.log(msg)},
    error:function(msg,err){
        console.log(msg)
        console.log(err.stack)
    }
};
var lograpLoggerInitialized = false
function getLogger() {
    if (!lograpLoggerInitialized && module.exports.logFactory) {
        logger = module.exports.logFactory()
        lograpLoggerInitialized = true
    }
    return logger;
}
function handleError(err) {
    if (err) {
        getLogger().error("caught error while processing apps",err)
        process.exit()
    }
}
var appTree = null;
module.exports.start = function() {
    console.log("loading moonshine")
    appTree = getDependencyTree()
    async.series(
        [
            loadSettings,
            applyMiddlewarePerModule,
            applyMiddlewarePost
        ]
        ,handleError)
}
function getDependencyTree() {
    var appTree = new AppTree()
    var rootDir = require.main?require.main.filename:process.cwd()
    appTree = appTree.loadTree({root:rootDir})
    //add moonshine foundation to the begining of the dependency tree
    appTree.addDependency([foundationApp].concat(getCoreApps()),true);
    return appTree;
}
function getCoreApps(){
    return [
        require("./core-apps/logging"),
        require("./core-apps/persistence"),
        require("./core-apps/server"),
        require("./core-apps/api"),
        require("./core-apps/static")
    ]
}
function loadSettings(cb){
    console.log("loading moonshine settings")
    var settings = module.exports.settings = {}
    settings.environment = configProcessor.getEnvironment()
    appTree.applyProcessor(function(app,cb){
        configProcessor.loadApp(app,settings,cb)
    },cb)
}
function applyMiddlewarePerModule(cb) {
    async.forEachSeries(module.exports.settings.middleware
        ,function(processor,cb){
            getLogger().debug("applying middleware:" + processor)
            async.series(getTaskListFromProcessor(processor),cb)
        }
        ,cb)
}
function getTaskListFromProcessor(processor) {
    processor = require(processor)
    var tasks = []
    if (processor.before) tasks.push(processor.before)
    if (processor.process)
        tasks.push(function(cb){
            appTree.applyProcessor(processor.process,cb)
        });
    if (processor.after) tasks.push(processor.after)
    return tasks;
}
function applyMiddlewarePost(cb) {
    async.forEachSeries(module.exports.settings.middleware
        ,function(processor,cb){
            processor = require(processor)
            if (processor.post) {
                processor.post(cb)
            } else {
                cb()
            }
        }
        ,cb)
}

module.exports.helpers = {
    middleware: require("./helpers/middleware-helper")
}
