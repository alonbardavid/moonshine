
module.exports.pre = function(cb){
    if (!global._middleware_method_called) global._middleware_method_called = []
    global._middleware_method_called.push("upper_pre")
    cb()
}
module.exports.before = function(cb) {
    global._middleware_method_called.push("upper_before")
    cb()
}
module.exports.process = function(app,cb) {
    global._middleware_method_called.push("upper_process," + app.module.filename)
    cb()
}
module.exports.after = function(cb) {
    global._middleware_method_called.push("upper_after")
    cb()
}
module.exports.post = function(cb) {
    global._middleware_method_called.push("upper_post")
    cb()
}
