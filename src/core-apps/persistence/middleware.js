var moonshine = require("../../")
var settings = moonshine.settings
var logger = moonshine.logFactory()
var mongoose = require("mongoose")

module.exports.pre = function setupPersistence(cb){
    moonshine.registerService("persistence",{
        models: {},
        schemas: {},
        getSchema: function(name){
            var schemas = moonshine.persistence.schemas;
            if (!schemas[name]) {
                schemas[name] = new mongoose.Schema({})
            }
            return schemas[name];
        },
        Schema: mongoose.Schema,
        native: mongoose
    })
    cb()
}

module.exports.process = moonshine.helpers.middleware.genericLoadAppFunction("model",logger);

module.exports.after = function registerSchemas(cb){
    var schemas = moonshine.persistence.schemas
    try {
        for (var modelName in schemas) {
            var schema = schemas[modelName]
            moonshine.persistence.models[modelName] = mongoose.model(modelName,schema)
        }
        mongoose.connect(settings.PERSISTENCE_CONNECTION);
        cb()
    } catch (err) {
        cb(err)
    }
}
