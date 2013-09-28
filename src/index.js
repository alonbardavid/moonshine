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
        var package = options.package || appModule.require("package.json")
        moonApps = package.moonApps || []
    } catch(e) {
        //no package.json
    }
    return AppTree.setupNode(appModule,{apps:moonApps})
}
function handleError(err) {
    if (err) {
        if (module.exports.logFactory) {
            var logger = module.exports.logFactory()
            logger.error("caught error while processing apps",err)
        } else {
            console.log("moonshine caught error while processing apps: " + err)
        }
        process.exit()
    }
}
var appTree = null;
module.exports.start = function() {
    console.log("loading moonshine")
    appTree = getDependencyTree()
    async.eachSeries(
        [
            loadSettings,
            applyMiddlewarePerModule,
            applyMiddlewarePost
        ]
        ,handleError)
    loadSettings(function(err){
        if (err) return handleError(err);
        applyAppProcessors()
    })
}
function getDependencyTree() {
    var appTree = AppTree()
    var rootDir = require.main?path.dirname(require.main.filename):process.cwd()
    appTree.loadTree({root:rootDir})
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
    appTree.applyProcessor(function(app){
        configProcessor.loadApp(app,settings,handleError)
    },cb)
}
function applyMiddlewarePerModule(cb) {
    async.forEachSeries(module.exports.settings.middleware
        ,function(processor,cb){
            async.series(getTaskListFromProcessor(processor),cb)
        }
        ,cb)
}
function getTaskListFromProcessor(processor) {
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
            if (processor.post) {
                processor.post(cb)
            } else {
                cb()
            }
        }
        ,cb)
}

module.exports.helpers = {
    middleware: require("./helpers/middlware-helper")
}