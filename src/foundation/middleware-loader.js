var async = require("async")
var MiddlewareLoader = module.exports =function MiddlewareLoader(middlewares,depTree,logger){
    this.middlewares = middlewares;
    this.logger = logger;
    this.depTree = depTree;
}
MiddlewareLoader.prototype.applyMiddlewareFunction =function(name) {
    var self = this;
    return function(cb){
        async.forEachSeries(self.middlewares
            ,function(processor,cb){
                processor = require(processor)
                if (processor[name]) {
                    processor[name](cb)
                } else {
                    cb()
                }
        },cb)
    }
}
MiddlewareLoader.prototype.applyMiddlewareProcessor =function(before,foreach,after) {
    if (!before) before = "before";
    if (!foreach) foreach = "process";
    if (!after) after = "after";
    var self = this;
    return function(cb){
        async.forEachSeries(self.middlewares
        ,function(middleware,cb){
            self.logger.debug("applying middleware:" + middleware)
            async.series(getTaskListFromProcessor(self.depTree,middleware,before,foreach,after),cb)
        }
        ,cb)
    }
}
function getTaskListFromProcessor(depTree,processor,before,foreach,after) {
    processor = require(processor)
    var tasks = []
    if (processor[before]) tasks.push(processor[before])
    if (processor[foreach])
        tasks.push(function(cb){
            depTree.applyProcessor(processor[foreach],cb)
        });
    if (processor[after]) tasks.push(processor[after])
    return tasks;
}