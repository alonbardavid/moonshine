module.exports.genericLoadAppFunction = function(moduleName,logger) {
    return function(app,cb) {
        try {
            var appModule = app.module.require("./" +moduleName)
            if (appModule.postLoad) {
                appModule.postLoad(cb)
            } else {
                cb()
            }
        } catch (e) {
            if (e.code && e.code == "MODULE_NOT_FOUND" ){
                return cb()
            }
            logger.error("exception while processing %s from module %s",appModule,module.filename,e)
            return cb(e)
        }
    }
}