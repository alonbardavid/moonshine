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
}
var models = moonshine.persistence.models

module.exports.process = moonshine.helpers.middlware.genericLoadAppfunction("model",logger);

module.exports.after = function registerSchemas(cb){
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
