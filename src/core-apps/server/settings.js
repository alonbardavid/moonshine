module.exports.config = function(settings) {

    settings.SERVER_PORT= 8080

    settings.middleware.push(require.resolve("./middleware"))
}
