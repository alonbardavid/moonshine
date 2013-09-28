var moonshine = require("../../")
var settings = moonshine.settings
var logger = moonshine.logFactory()
var express = require("express")
    , http = require('http');
module.exports.before = function setupExpress(cb){
    moonshine.server = {
        app:express(),
        native:express
    }
    cb()
}

module.exports.post = function startListening(cb){
    try {
        var httpServer =http.createServer(moonshine.server.app)
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
