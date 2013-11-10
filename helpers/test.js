var async = require("async")
module.exports.resetMoonshine = function(done){
    Object.keys(require.cache).forEach(function(key){
        delete require.cache[key];
    })
    global.__moonshine_loaded = undefined
    done()
}

module.exports.clearDB = function(done) {
    var moonshine = require("../")
    async.each(moonshine.db.models,function(model,cb){
        model.remove({},cb)
    },done)
}
Object.defineProperty(module.exports, "apiRoot", {get : function(){
    var moonshine = require("../")
    return "http://localhost:" +moonshine.settings.SERVER_PORT + moonshine.settings.API_ROOT_PATH
}})
Object.defineProperty(module.exports, "httpRoot", {get : function(){
    var moonshine = require("../")
    return "http://localhost:" +moonshine.settings.SERVER_PORT
}})