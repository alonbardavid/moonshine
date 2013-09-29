var moonshine = require("../../")
var settings = moonshine.settings
var logger = moonshine.logFactory()
var fs = require("fs"),
    path = require("path"),
    async = require("async")

var models = moonshine.persistence.models
var paths = {}
module.exports.process = function collectStatic(app,cb){
    try{
        var staticDir = path.join(path.dirname(app.module.filename),"static")
        collectDirPaths(staticDir,"",cb)
    } catch(e){
        cb(e)
    }
}
function collectDirPaths(absoluteDirPath,baseUrl,cb) {
    fs.exists(absoluteDirPath,function(exists){
        if (!exists) return cb()
        fs.readdir(absoluteDirPath,function(err,dirContents){
            if (err) cb(err)
            async.forEachSeries(dirContents
                ,function(filename,cb){
                    fs.stat(path.join(absoluteDirPath,filename),function(err,stat){
                        if(stat.isDirectory()) {
                            collectDirPaths(path.join(absoluteDirPath,filename),baseUrl + "/" + filename,cb)
                        } else {
                            paths[baseUrl + "/" + filename] = path.join(absoluteDirPath,filename)
                            cb()
                        }
                    })
                },cb)
        })
    })
}
module.exports.after = function setupRouter(cb){
    moonshine.server.app.use(settings.STATIC_ROOTPATH,function(req,res,next){
        var path = req.path.replace(settings.STATIC_ROOTPATH,"")
        if (paths[path]){
            res.sendfile(paths[path])
        }else {
            next()
        }
    })
    cb()
}