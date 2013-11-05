var moonshine = require("./")
module.exports.run = function(args,cb) {
    var commandName = args[0]
    var apps = [process.cwd()]
    return moonshine.runCommand(commandName,apps,args,cb)
}