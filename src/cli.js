var moonshine = require("./")
module.exports.run = function(args,cb) {
    var commandName = args[0]
    var apps = [process.cwd()]
    var promise = moonshine.runCommand(commandName,apps,args)
    if (cb) return promise.then(cb,cb)
    promise.then(function(shouldExit){
        if(shouldExit) {
            process.exit()
        }
    },function(err){
        console.log("process exited with error")
        console.log(err.stack)
        process.exit()
    })
}