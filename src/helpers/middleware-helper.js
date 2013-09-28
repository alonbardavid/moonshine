module.exports.genericLoadApp = function(moduleName,logger) {
    return function(module,cb) {
        try {
            module.require.resolve("./" +moduleName)
        } catch (e) {
            // module does not exist
            return cb()
        }
        try {
            var appModule = module.require.resolve("./" +moduleName)
            if (appModule.postLoad) {
                appModule.postLoad(cb)
            } else {
                cb()
            }
        } catch(e) {
            logger.error("exception while processing %s from module %s",appModule,module.filename,e)
            cb(e)
        }
    }
}