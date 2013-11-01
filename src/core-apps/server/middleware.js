var moonshine = require("../../")
var settings = moonshine.settings
var logger = moonshine.logFactory()
var express = require("express")
    , http = require('http');
module.exports.pre = function setupExpress(cb){
    moonshine.registerService("server",{
        app:express(),
        native:express,
        httpServer:null
    })
    cb()
}

module.exports.post = function startListening(cb){
    try {
        var httpServer =moonshine.server.httpServer =http.createServer(moonshine.server.app)
        httpServer.listen(settings.SERVER_PORT)
        httpServer.on("listening",function(){
            logger.info("Server listening on port %d in %s modes",httpServer.address().port,settings.env)
            cb()
        })
        httpServer.on("error",function(err){
            logger.error("could not start server, got exception binding address",err);
            cb(err)
        })
    } catch(e){
        cb(e)
    }
}
module.exports.shutdown = function(cb){
    moonshine.server.httpServer.close(cb)
}