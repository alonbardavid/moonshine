module.exports.config = function(settings) {

    settings.API_ROOT_PATH= "/api/v1/"

    settings.middleware.push(require.resolve("./middleware"))
}
