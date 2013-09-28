var path= require("path")
module.exports = function(grunt){
	var _ = grunt.util._
    var run = function(done,command,args,options){
        var env = process.env;
        env.path= process.env.path + ";" + process.cwd() + path.sep + "node_modules" + path.sep + ".bin" + path.sep
        var options = _.extend({cwd:process.cwd(),stdio:"inherit"},options);
        if (process.platform == "win32") {
            args.unshift("/c",command);
            command = "cmd"
		}
        proc = grunt.util.spawn({cmd:command,args:args,opts:options}, done)
	}
    grunt.registerMultiTask("mocha","run tests with mocha", function(){
        files = grunt.file.expand(this.data, (grunt.option("src") || this.data.src))
        run(this.async(), "mocha" , ["--harmony-proxies", "--recursive", "--reporter", "Spec"].concat(files))
    })
   
	grunt.initConfig({         
        mocha:{
            test: {
                src: "test/*.*"
			}
		}
    })
	grunt.registerTask("test:unit", ['mocha'])
}