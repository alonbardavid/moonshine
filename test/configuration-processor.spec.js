var instance = require("../src/foundation/configuration-processor")
var path = require("path"),
    assert = require("assert")
describe("configuration processor test",function(){
    describe("test load dir",function(){
        it("should load settings file",function(done){
            var app = require(path.join(__dirname,"_configuration-processor","SimpleSetup"))
            instance.loadApp(app,{environment:"DEV"},function(err,settings){
                assert.equal(settings.test,"simpleSetup settings test")
                done()
            })
        })
        it("should override settings file with environment file",function(done){
            var app = require(path.join(__dirname,"_configuration-processor","environmentSetup"))
            instance.loadApp(app,{environment:"PROD"},function(err,settings){
                assert.equal(settings.test,"environmentSetup settings test")
                assert.equal(settings.overrideTest,"environmentSetup settings.prod test")
                done()
            })
        })
        it("should override settings file with multiple environment files, in order",function(done){
            var app = require(path.join(__dirname,"_configuration-processor","multipleEnvironmentSetup"))
            instance.loadApp(app,{environment:["PROD","MOREPROD"]},function(err,settings){
                assert.equal(settings.test,"multipleEnvironmentSetup settings test")
                assert.equal(settings.overrideTest,"multipleEnvironmentSetup settings.prod test")
                assert.equal(settings.doubleOverrideTest,"multipleEnvironmentSetup settings.moreProd test")
                done()
            })
        })
        it("should not return error if settings module does not exist",function(done){
            var app = require(path.join(__dirname,"_configuration-processor","noSettingsSetup"))
            instance.loadApp(app,{environment:["DEV"]},function(err,settings){
                assert.deepEqual(settings,{environment:["DEV"]})
                done()
            })
        })
        it("should load the second module if the first module does not exist",function(done){
            var app = require(path.join(__dirname,"_configuration-processor","noFirstSettingSetup"))
            instance.loadApp(app,{environment:["PROD","MOREPROD"]},function(err,settings){
                assert.equal(settings.overrideTest,"noFirstSettingSetup settings.moreProd test")
                done()
            })
        })
        it("should return an exception if the config function throw an exception",function(done){
            var app = require(path.join(__dirname,"_configuration-processor","errorEnvironmentSetup"))
            instance.loadApp(app,{environment:["PROD","MOREPROD"]},function(err,settings){
                assert.ok(err)
                done()
            })
        })
    })
    describe("test get environment",function(){
		it("should return TEST if running from mocha",function(done){
            var env = instance.getEnvironment()
            assert.deepEqual(env,["TEST"])
            done()		
		})
        it.skip("should return DEV if no environment is provided",function(done){
            var env = instance.getEnvironment()
            assert.deepEqual(env,["DEV"])
            done()
        })
        it.skip("should load from system variables",function(done){
            process.env.MOONSHINE_ENVIRONMENT = "PROD,ELSE"
            var env = instance.getEnvironment()
            assert.deepEqual(env,["PROD","ELSE"])
            done()
        })
        it("should load from command argument first if existing",function(done){
            process.env.MOONSHINE_ENVIRONMENT = "PROD,ELSE"
            process.argv.push("--environment=SECOND,OTHER")
            var env = instance.getEnvironment()
            assert.deepEqual(env,["SECOND","OTHER"])
            done()
        })
    })
})