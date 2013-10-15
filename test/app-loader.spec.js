var assert = require("assert")
var logger = {
    debug:function(msg){},
    info:function(msg){},
    error: function(msg,err) {console.log(msg);console.log(err)}
}
describe("test loading apps",function(){

    it("it should load moonApps from package.json if not provided",function(done){
        var depTree = require("./_app-loader/simpleModule")
        assert.equal(depTree.dependsOn.length,1)
        assert.equal(depTree.dependsOn[0],require("./_app-loader/simpleModule/node_modules/sample_app"))
        done()
    })
    it("it should load moonApps from provided json",function(done){
        var depTree = require("./_app-loader/noPackageModule")
        assert.equal(depTree.dependsOn.length,1)
        assert.equal(depTree.dependsOn[0],require("./_app-loader/noPackageModule/node_modules/sample_app2"))
        done()
    })
    it("it should push additional dependencies to the start of the dep tree",function(done){
        var root = require.resolve("./_app-loader/simpleModule")
        var AppLoader = require("../src/foundation/app-loader")
        var appLoader =  new AppLoader(logger)
        appLoader.start(root,require("./_app-loader/noPackageModule"),require("./_app-loader/filenameMiddleware"))
        var loadedModules = require("./_app-loader/filenameMiddleware/node_modules/filenameMiddleware/middleware").collected
        assert.equal(loadedModules.length,6)
        assert.ok(loadedModules[0].match(/.*noPackageModule.*sample_app2/))
        assert.ok(loadedModules[1].match(/.*noPackageModule.index\.js/))
        assert.ok(loadedModules[2].match(/.*filenameMiddleware.*filenameMiddleware/))
        assert.ok(loadedModules[3].match(/.*filenameMiddleware.index\.js/))
        assert.ok(loadedModules[4].match(/.*simpleModule.*sample_app/))
        assert.ok(loadedModules[5].match(/.*simpleModule.index\.js/))
        done()
    })
})
describe("test loading settings",function(){
    it("it should load settings",function(done){
        var AppLoader = require("../src/foundation/app-loader")
        var appLoader =  new AppLoader(logger)
        appLoader.start(require.resolve("./_app-loader/settingsModule"))
        var settings = appLoader.settings
        assert.equal(settings.upper,"fromUpper")
        assert.equal(settings.nested,"fromNested")
        assert.equal(settings.toOverwrite,"fromUpper")
        done()
    })
})

describe("test middleware loading",function(){
    it("it should call all middleware functions in order",function(done){
        var AppLoader = require("../src/foundation/app-loader")
        var appLoader =  new AppLoader(logger)
        appLoader.start(require.resolve("./_app-loader/fullMiddlewareModule"))
        var upper_name = require.resolve("./_app-loader/fullMiddlewareModule")
            inner_name = require.resolve("./_app-loader/fullMiddlewareModule/node_modules/fullMiddlewareNestedModule")
        assert.deepEqual(global._middleware_method_called,[
        "inner_pre",
        "upper_pre",
        "inner_before",
        "inner_process," + inner_name,
        "inner_process," + upper_name,
        "inner_after",
        "upper_before",
        "upper_process," + inner_name,
        "upper_process," + upper_name,
        "upper_after",
        "inner_post",
        "upper_post"
        ])
        global._middleware_method_called = undefined
        done()
    })
    it("it should not crush if some middleware function doesn't exist",function(done){
        var AppLoader = require("../src/foundation/app-loader")
        var appLoader =  new AppLoader(logger)
        appLoader.start(require.resolve("./_app-loader/noFunctionMiddlewareModule"))
        //should not throw exception
        assert.ok(global._no_function_middleware_called)
        global._no_function_middleware_called = undefined
        done()
    })
})