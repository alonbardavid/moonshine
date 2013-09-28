var assert = require("assert"),
    path = require("path")
var appTree = require("../src/foundation/app-tree")
describe("test dependency tree apply",function(){

    function checkTrees(rootDir,cb){
        var instance = new appTree().loadTree({root:rootDir});
        var files = []
        instance.applyProcessor(
            function(app,cb){
                files.push(app.module.filename);
                cb()
            },
            function(){
                cb(files)
        })
    }

    it("should only run on deps in apps",function(done){
        var rootDir = path.join(__dirname,"_app-tree","simpleSetup")
        checkTrees(rootDir,function(files){
            assert.equal(files.length,2)
            assert.equal(files[0],path.join(rootDir,"node_modules","inapps","middleware-helper.js"))
            assert.equal(files[1],path.join(rootDir,"middleware-helper.js"))
            done()
        })
    })
    it("should run on peer dep apps according to dependencies",function(done){
        var rootDir = path.join(__dirname,"_app-tree","peerSetup")
        checkTrees(rootDir,function(files){
            assert.equal(files.length,3)
            assert.equal(files[0],path.join(rootDir,"node_modules","nondependentApp","middleware-helper.js"))
            assert.equal(files[1],path.join(rootDir,"node_modules","dependentApp","middleware-helper.js"))
            assert.equal(files[2],path.join(rootDir,"middleware-helper.js"))
            done()
        })
    })
    it("should run only once if two apps depend on it",function(done){
        var rootDir = path.join(__dirname,"_app-tree","multiDependSetup")
        checkTrees(rootDir,function(files){
            assert.equal(files.length,4)
            assert.equal(files[0],path.join(rootDir,"node_modules","nondependentApp","middleware-helper.js"))
            assert.equal(files[1],path.join(rootDir,"node_modules","dependentApp","middleware-helper.js"))
            assert.equal(files[2],path.join(rootDir,"node_modules","dependentApp2","middleware-helper.js"))
            assert.equal(files[3],path.join(rootDir,"middleware-helper.js"))
            done()
        })
    })
    it("should run only once if parent and child depend on it",function(done){
        var rootDir = path.join(__dirname,"_app-tree","parentDependSetup")
        checkTrees(rootDir,function(files){
            assert.equal(files.length,3)
            assert.equal(files[0],path.join(rootDir,"node_modules","nondependentApp","middleware-helper.js"))
            assert.equal(files[1],path.join(rootDir,"node_modules","dependentApp","middleware-helper.js"))
            assert.equal(files[2],path.join(rootDir,"middleware-helper.js"))
            done()
        })
    })
    it("should allow accessing modules in files",function(done){
        var rootDir = path.join(__dirname,"_app-tree","innerRequireSetup")
        var instance = new appTree().loadTree({root:rootDir});
        var strings = []
        instance.applyProcessor(
            function(app,cb){
                strings.push(app.module.require("./print")())
                cb()
            },
            function(){
                assert.equal(strings.length,2)
                assert.equal(strings[0],"in inner function")
                assert.equal(strings[1],"in outer function")
                done()
            }
        )
    })
})

