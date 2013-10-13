module.exports.config = function(settings) {
    settings.middleware.push(require.resolve("./middleware"))
}
