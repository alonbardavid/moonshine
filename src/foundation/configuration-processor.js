
function loadSettingsModule(appModule,name,settings) {
    var moduleSettings = null;
    try {
        moduleSettings = appModule.require(name)
    } catch(e){
        if (e.code && e.code == "MODULE_NOT_FOUND" ){
            return settings;
        }
        throw e;
    }
    moduleSettings.config(settings)
}
module.exports.loadApp = function(app,settings,cb){
    settings = settings || {}
    settings.environment = [].concat(settings.environment)
    try {
        loadSettingsModule(app.module,"./settings",settings)
        for (var i=0;i<settings.environment.length;i++) {
            var name = "./settings." + settings.environment[i].toLowerCase()
            loadSettingsModule(app.module,name,settings)
        }
    } catch(e){
        //problem loading settings
        return cb(e)
    }
    cb(null,settings)
}
function parseEnvString(envString) {
    return envString.split(",")
}
module.exports.getEnvironment = function(){
    for (var i =0;i<process.argv.length;i++){
        var arg = process.argv[i]
        if (arg.indexOf("--environment") == 0) {
            return parseEnvString(arg.substr(14))
        }
    }
    if (/.*_mocha/.test(require.main.filename)) {
        return ["TEST"]
    }
    if (process.env.MOONSHINE_ENVIRONMENT) {
        return parseEnvString(process.env.MOONSHINE_ENVIRONMENT)
    }
    return ["DEV"]
}
