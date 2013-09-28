var moonshine = require("../../")
var settings = moonshine.settings
var logger = moonshine.logFactory()
var fs = require("fs"),
    path = require("path"),
    async = require("async")

var models = moonshine.persistence.models
var paths = {}
module.exports.process = function collectStatic(module,cb){
    var staticDir = path.join(path.dirname(module.filename),"static")
    collectDirPaths(staticDir,"",cb)
}
function collectDirPaths(absoluteDirPath,baseUrl,cb) {
    fs.readdir(absoluteDirPath,function(err,dirContents){
        if (err) cb(err)
        async.forEachSeries(dirContents
            ,function(filename,cb){
                fs.stat(path.join(absolutePath,filename),function(err,stat){
                    if(stat.isDirectory()) {
                        processDir(path.join(absolutePath,filename),baseUrl + "/" + filename,cb)
                    } else {
                        files[baseUrl + "/" + filename] = path.join(absolutePath,filename)
                        cb()
                    }
                })
            },cb)
    })
}
module.exports.after = function registerSchemas(cb){
    moonshine.server.app.use(settings.STATIC_ROOTPATH,function(req,res,next){
        var path = req.path.replace(settings.STATIC_ROOTPATH,"")
        if (paths[path]){
            res.sendFile(paths[path])
        }else {
            next()
        }
    })
}