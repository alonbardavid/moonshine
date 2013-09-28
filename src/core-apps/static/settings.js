module.exports.config = function(settings) {
    settings.STATIC_ROOTPATH = "/static"
    settings.middleware.push(require.resolve("./middleware"))
}
