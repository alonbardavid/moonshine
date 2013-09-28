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
}

module.exports.post = function startListening(cb){
    var httpServer =http.createServer(moonshine.server)
    server.listen(settings.SERVER_PORT)
    server.on("listening",function(){
        logger.info("Server listening on port %d in %s modes",server.address().port,settings.env)
        cb()
    })
    server.on("error",function(err){
        logger.error("could not start server, got exception binding address",err);
        cb(err)
    })
}
