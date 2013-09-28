module.exports.config = function(settings) {

    settings.PERSISTENCE_CONNECTION= "mongodb://localhost/moonshine"

    settings.middleware.push(require.resolve("./middleware"))
}
