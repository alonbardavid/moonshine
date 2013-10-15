var logger = {
    debug:function(msg){},
    info:function(msg){},
    error: function(msg,err) {console.log(msg);console.log(err)}
}
var AppLoader = require("../../../src/foundation/app-loader")
var appLoader =  new AppLoader(logger)
module.exports = appLoader.defineApp(module,{package:{moonApps:["fullMiddlewareNestedModule"]}})