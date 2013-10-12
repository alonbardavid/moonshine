/*

*/
var async = require("async")
function Instance(module,apps){
    this.dependsOn = []
    this.loadDependnecies(module,apps);
    this.module = module
}
Instance.prototype.loadDependnecies = function(module,apps) {
    var self=this;
    apps.forEach(function(app){
        var appModule =  module.require(app)
        self.addDependencies(appModule)
        if (self.dependsOn.indexOf(appModule) < 0) {
            self.addDependency(appModule)
        }
    })
}
Instance.prototype.addDependencies = function(appModule,toStart) {
    var self=this;
    var modulesToIterate = appModule.dependsOn;
    if (toStart) {
        var originalDepends = self.dependsOn;
        self.dependsOn = appModule.dependsOn;
        modulesToIterate = originalDepends
    }
    modulesToIterate.forEach(function(dependency) {
        if (self.dependsOn.indexOf(dependency) < 0) {
            self.addDependency(dependency)
        }
    })
}
Instance.prototype.addDependency = function(appModule,toStart) {
    if (toStart) {
        this.dependsOn = [].concat(appModule).concat(this.dependsOn)
    } else {
        this.dependsOn = this.dependsOn.concat([].concat(appModule))
    }
}
Instance.prototype.applyProcessor = function(processor,cb) {
    var self = this;
    async.eachSeries(self.dependsOn.concat([self]),function(module,cb){
        if (typeof processor == 'string' || processor instanceof String) processor = require(processor)
        processor(module,cb)
    },cb)
}
module.exports.setupNode = function(module,options){
    options = options || {}
    options.apps = options.apps || []
    return new Instance(module,options.apps)
}
module.exports.loadTree = function(options){
    options = options || {};
    options.root = options.root || process.cwd()
    return require(options.root)
}
