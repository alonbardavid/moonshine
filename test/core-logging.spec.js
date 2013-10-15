var assert = require("assert"),
    winston = require("winston")


describe("test logging setup",function(){
    beforeEach(function(done){
        Object.keys(require.cache).forEach(function(key){
            delete require.cache[key];
        })
        global.__moonshine_loaded = undefined
        done()
    })
    function setupWinston(newSettings,transportOptions) {
        newSettings = newSettings || {}
        transportOptions = transportOptions || {}
        newSettings.LOGGING_LOG_LEVEL = newSettings.LOGGING_LOG_LEVEL || "debug"
        global._mock_app_settings = function(settings){
            var keys = Object.keys(newSettings)
            for (var index in keys) {
                var key = keys[index]
                settings[key] = newSettings[key]
            }
            settings.LOGGING_SETUP_TRANSPORTS = function(winston){
                transportOptions.level = settings.LOGGING_LOG_LEVEL
                transportOptions.raw = true
                winston.add(winston.transports.Memory,transportOptions)
            }
        }
    }
    function getLogs(moonshine) {
        var logs = moonshine.logging.native['default'].transports['memory'].writeOutput
        for (var i=0;i<logs.length;i++) {
            logs[i] = JSON.parse(logs[i])
        }
        return logs
    }
    it("should setup lograp and allow logging",function(done){
        var moonshine = require("../src")
        setupWinston()
        moonshine.start(true,require.resolve("./_mock_app"),
            [require("../src/core-apps/base"),require("../src/core-apps/logging")])
        assert.ok(moonshine.logFactory)

        var logger = moonshine.logFactory()
        logger.info("something to debug")

        var logs =  getLogs(moonshine)
        assert.equal(logs.length,1)
        assert.equal(logs[0].level,"info")
        assert.ok(logs[0].message.match(/.* \[.*core-logging\.spec\.js\] - something to debug/))
        done()
    })
    it("should filter logs lower then level",function(done){
        var moonshine = require("../src")
        setupWinston({
            LOGGING_LOG_LEVEL:"error"
        })
        moonshine.start(true,require.resolve("./_mock_app"),
            [require("../src/core-apps/base"),require("../src/core-apps/logging")])
        var logger = moonshine.logFactory()

        logger.info("something to debug")
        var logs =  getLogs(moonshine)
        assert.equal(logs.length,0)
        done()
    })

})

