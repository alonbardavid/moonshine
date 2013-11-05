///moonshine is a singleton
if (global.__moonshine_loaded) throw new Error("moonshine has been required twice. moonshine is a singleton and should never be dependent more then once. make sure that you use peerDependencies in npm when depending on moonshine")
global.__moonshine_loaded = true;

var moonshineCore = require("moonshine-core")

moonshineCore.addBaseApp(module.filename)

module.exports = moonshineCore
