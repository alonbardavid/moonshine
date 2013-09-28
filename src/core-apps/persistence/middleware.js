var moonshine = require("../../")
var settings = moonshine.settings
var logger = moonshine.logFactory()
var mongoose = require("mongoose")

module.exports.before = function setupPersistence(cb){
    moonshine.persistence = {
        models: {},
        Schema: mongoose.Schema,
        native: mongoose
    }
    cb()
}

module.exports.process = moonshine.helpers.middleware.genericLoadAppFunction("model",logger);

module.exports.after = function registerSchemas(cb){
    var models = moonshine.persistence.models
    try {
        for (var modelName in models) {
            var model = models[modelName]
            moonshine.persistence.models[modelName] = mongoose.model(modelName,model)
        }
        cb()
    } catch (err) {
        cb(err)
    }
}
