moonshine
====================

Moonshine is a web framework for rapid development for SPA (Single Page Application) websites built with the MEAN stack - Mongodb, express.js, angular.js and node.js, inspired by Python's Django framework.

The main purpose behind Moonshine is to create a framework that allows you to create reusable components providing both server-side and client-side functionality in a SPA application.

>**WARNING!!!** Moonshine is in very early Alpha, and should be used with great care.

For those who prefer examples, you can check out the [examples repository](https://github.com/Illniyar/moonshine-examples)

###Features (Core):

* __A component framework and ecosystem__ that lets you build modules that interact with other modules by using and providing extensions, which you can share with others.
  * For example consider a Scheduled Job component - that allows other modules to have files that define what jobs to run and at what times.
	Components can also send events which can be registered on a shared event-emitter.
* __Dependency resolution mechanism__ that allows you to run functions by dependency order, and makes sure components are initialized before being used.
* __A service locator pattern__ (directly accessible from the moonshine module).
* __A command framework__ that allows you to design commands as part of you Component which you can run on the command line (and initializes all relevant components).
* __A configuration system__ that allows Components to override configuration provided by Components they depend on. 

###Features (bundled):
* __Standard based logging__.
* __Bundled test commands__ - for Mocha and Karma.
* __Easy access to the main express.js app__
* __Static file management__ - Components can now expose both server-side and client-side code.
* __Persistence with Mongodb__ - easy placement of Model files, Components  can define and register their own models
* __Rest interface for you Mongodb models__ - Components can register routes for commonly used models.

##User guide:

###Table of content

* [Installation](#installation)
* [Quick start](#quick-start)
* [Using components](#using-components)
* [Creating extendable components](#creating-extendable-components)
* [Bundled features](#bundled-features)
 * [Mongodb support](#mongodb-support)
 * [Express.js support](#expressjs-support)
 * [Logging support](#logging-support)
 * [Static file support](#static-file-support)
 * [Baucis support](#baucis-support)
 * [Angular.js support](#angularjs-support)
 * [Testing](#testing)
* [Gotchayas](#gotchayas)


###Installation:

To install: 
```
npm install moonshine-js
```

Make sure you have a mongodb service running on the default port.

To run moonshine commands globally: 
```
npm install moonshine-cli -g
```

###Quick start:
Let's make a simple example of a note application (you'll be able to add notes, and they'll persist to the database, refresh to see them appear).
Create an empty file called index.js (moonshine.js requires one at the moment)
Create a file in your project folder called "model.js" with the following:
```js
	var Note = require("moonshine-js").db.getSchema("Note");
	Note.add({
		text: String,
	})
```
Create a file called "api.js" with the following:
```js
	require("moonshine-js").api.createResource("Note")
```
Create  a file called "static/index.html" (index.html file inside a folder named "static"), with the following:
```html
	<html ng-app="exampleApp">
		<head>
		<script src="lib/angular.js"></script>
		<script src="lib/underscore-min.js"></script>
		<script src="lib/restangular.min.js"></script>
		<script src="js/moon.angular.js"></script>
		<script type="text/javascript">
			var example =angular.module('exampleApp',["moon.angular"])
			example.controller("MainCtrl",["Restangular","$scope",function(Restangular,$scope){
				var resource = Restangular.all('notes')
				resource.getList().then(function(notes){
					$scope.notes = notes;
				});
				$scope.addNote = function(newNote) {
					resource.post(newNote).then(function(newResource){
							$scope.notes.push(newResource);
					})
				}	
			}])
		</script>
		</head>
		<body>
		<div ng-controller="MainCtrl">
			<div>notes:</div>
			<div ng-repeat="note in notes">
				{{note.text}}
			</div>
			<div> add new note:</div>
			<div><label>text:</label><input type="text" ng-model="newNote.text"/></div>
			<button type="submit" ng-click="addNote(newNote);newNote={}">Submit</button>
		</div>
		</body>
	</html>
```

now just type `moonshine runserver` and go to http://localhost:8080/ to see the result.

###Using components:
Create a settings.js file, and add the component to `module.exports.requiredComponents` (requiredComponents is a list of modules that can be resolved using require.resolve).

For instance to use moon-contrib-user simply add the following line to your settings.js file:
```js
	module.exports.requiredComponents = ["moon-contrib-user"]
```
Note that you can also use local components (for instance "./my-component")

###Creating extendable components:
All applications built with moonshine are essentially Components. 
However to enable reusability and cross interaction, moonshine provides Components with extension points that allow for easy integration with other Components.

* __extension.js__ - If a Component has an extension.js file in it's source folder, moonshine will incorporate  it in it's extension lifecycle.
	An extension.js file can expose certain attributes in it's export object that moonshine will run:
  1. setup(done) - this function is called once for every extension in dependency order.
  2. extend - an object container three functions:
    2.1. before(done) - called before the process phase begins.

     2.2. process(component,done) - is called for each component in dependency order. 

     The component variable is the actual index module of the component (not it's export), so you can use it's resolve and require functions.
			 Note that moonshine calls each extension with all components in order.
			 For example, if we have `comp1,comp2` components and `ext1,ext2` components the order of execution will be: `ext1.process(comp1),ext1.process(comp2),ext2.process(comp1),ext2.process(comp2)`

     2.3. after(done) - called after all components have been processed in the process phase.
3. wrapup(done) - this function is called once for evey extension in dependency order after all extend phases have been completed.
	
* __signals__

  Moonshine exposes a unified event system - `require("moonshine-js").signal(signalName,params)` .
  Any module can listen on it by using `require("moonshine-js").addHook(signalName,function())`
	
* __commands__
  
  Moonshine allows you to create arbitrary commands that can be run using the moonshine cli.
	To create a command inside you component, add a commands folder inside your source folder.
	Any javascript file in it that exports an execute command will be accessible using that file's name (I.E. if it's named _test.js_, you can use `moonshine test` in the terminal to run it)
	The command will be run after all other components have been loaded, so you have access to the full power of Moonshine.
	
* __settings__
	Moonshine has a configuration object that is available under `require("moonshine-js").settings`.
	Any Component can had to that object by including _settings.js_ file inside it's source folder.
	_settings.js_ file needs to export a config method that receives a settings object (I.E. `exports.config = function(settings){ settings.MY_SETTING = false;}` )
	
	You can also override settings for Component that you depend on, and Component that depend on your Component can override your settings.
	
* __register service__
	Moonshine provides a rudimantery Service locator interface, simply  call `require("moonshine-js").registerService(yourService)`, and anyone can access your service using `require("moonshine-js").yourService` .
	
##Bundled features
###Mongodb support:
Moonshine comes built in with support for mongodb using Mongoose.
Any Component can add a model.js file (or model folder with index.js file) that will be called during the Model registration phase.
You can use moonshine.db.getSchema(<schema name>) to retrieve (or create a new) Mongoose Schema .
Moonshine will automatically register the schemas as models and connect to the database after all models are loaded.
	
__*API*__

* __*Extension files*__:
  * __model.js__: where you should define your Schemas. 
* __*Service*__:
  * __moonshine.db__:
     * __models__: a map of models after they have been registered in Mongoose
     * __schemas__: a map of the original schemas
     * __getSchema__: a function to retrieve a Schema or create a new Schema.
     * __Schema__: access to Mongoose's Schema object
     * __native__: the native Mongoose object
			
* __*Signals*__:
     * __db.models_loaded__: called after all models have been registered with Mongoose.
     * __db.connected__: called after moonshine connected to the database
		
* __*Available Settings*__:
     * __DB_CONNECTION__: connection string for the mongodb service.
      -- defaults to mongodb://localhost/moonshine
		
###Express.js support:
Moonshine exposes the express.js app via moonshine.server.app , which is available to define new routes or register middleware.
	
__*API*__

* __*Service*__:
 * __moonshine.server__:
     * __app__: the express.js app
     * __native__: access to the express.js object
     * __httpServer__: available after the runserver command completes, exposes the node.js' http.createServer object
     * __shutdown__: function receiving  callback. Available after the runserver command completes successfully, will shutdown the server
			
* __*Signals*__:
 * __server.started__: called after runserver command completes successfully
 * __server.shutdown__: called after the httpserver was closed successfully
		
* __*Available Settings*__:
 * __SERVER_PORT__: the port to listen on. Defaults to 8080
* __*Commands*__:
 * __runserver__: starts the server.
 * __test:__ if mocha is installed, will run all `test/**/*.spec.js` files from the current working directory.

###Logging support:
Moonshine provides a centralized logging framework available under moonshine.logFactory.
	Use require("moonshine-js").logFactory() to create a new logger, which automatically uses the module's filename in logs.
	
__*API*__
	
* __*Service*__:
 * __moonshine.logFactory__: a function that will return a logger.
 * __logging__:
     * __native: access to the native winston object.
		
* __*Available Settings*__:
 * __LOGGING_ROOT_PATH__: defaults to the cwd. When logging filenames of callers, it will reduct the *LOGGING_ROOT_PATH* from the filename, for shorter logs
 * __LOGGING_WINSTON_COLOR__: winston colors object. 
 * __LOGGING_LOG_LEVEL__: what level to log. defaults to "debug"
 * __LOGGING_SETUP_TRANSPORTS__: a function that receives the winston object and can define different transports. The default transport is the console.
		
###Static file support:
Moonshine allows all components to define a "static" folder inside their source folder, that will be exposed to clients.
	Anything under the static folder will be available to routes.
	Components can override static files of Components they depend on.
	
__*API*__
	
* __*Extension files*__:
 * __static__: any files under Static folder will be available under the static_routes path.
	
* __*Service*__:
 * __static__:
     * __files__: a map of routes mapped to absolute file paths.
	
* __*Available Settings*__:
* __STATIC_ROUTES__: a map of routes and filesystem prefixes. 
--defaults to "/":"/".
			     
   For example in the default case the file `"static/myFile.html"` will be available under `localhost:port/myFile.html` 
			In the case of `"/first":"/prime"`, the file `"static/prime/myFile.html"` will be available under `localhost:port/first/myFile.html`
* __STATIC_ALIAS__: a map of aliases for routes. defaults to `"/":"/index.html"`
	
###Baucis support:
Moonshine provides easy REST services using [Baucis](https://github.com/wprl/baucis).
	Any Component can add an api.js file (or an api folder with index.js file) that will be called during the Api registration phase.
	You can use `moonshine.api.createResource(name,options)` to create a new resource using Baucis.
	Moonshine will automatically register the apis after all apis are loaded.
	
__*API*__
	
* __*Extension files*__:
 * __api.js__: where you should define your Resources.
		
* __*Service*__:
 * __moonshine.api__:
     * __resources__: a map of resources after they have been registered with Baucis
     * __resourceOptions__: a map of the original options sent to Baucis
     * __createResource(singular name,options)__: a function to create a new Resource.
     * __createNestedResource(singular name, parent resource name,options)__: a function to create a resource that will be nested under the parent resource.
     * __native__: the native Baucis object
			
* __*Signals*__:
 * __api.resources_loaded__: called after all resources have been loaded.
 * __api.api_registered__: called after the Baucis object was added to express.js
		
* __*Available Settings*__:
 * __API_ROOT_PATH__: url prefix for accessing the api. defaults to "/api/v1/"
		
###Angular.js support:
Angular.js,Restangular and angular-ui-router libraries are available under "/lib" static route.
	A new angular module called moon.angular is available under moon.angular.js, which fixes some Restangular defaults to match Moonshine's workbase.
	It also provides a way to load modules on the fly using the scriptLoader module.
	
__*API*__
	
* __*Angular modules*__:
 * __moon.angular__: performs defaults configurations for Restangular.
* __*Services*__:
 * __scriptLoader__: the angular.js file provided with moonshine was patched to include https://github.com/angular/angular.js/pull/4694. 
							  When changing routes, the scriptLoader will attempt to fetch a module by the name of the route (I.E. if the route was "temp", it'll attempt to find "/js/temp.js".
 * __scriptLoaderProvider__:
     * __scriptPrefix__: change script prefix path. defaults to "/js"
     * __disableAutoScriptLoading__: prevent automatic script loading on route change. defaults to false
     * __scriptLocationResolver(stateInfo)__: a function that allows arbitrary path resolution. 
	
###Testing
Moonshine comes with two built in testing support - _Mocha_ and _Karma_ .

* __Mocha__ : if you have _Mocha_ installed in node_modules, and run `moonshine test` all files under the pattern `test/**/*.spec.js` will be run using Mocha.
* __Karma__ : if you have _Karma_ and _karma-mocha_ installed in node_modules, and run `moonshine test` all files under the pattern `test/**/*.client.js` will be run using Mocha.
 * you can add a karma.config.js file in your cwd to override default karma config (to use a different test runner or browser for instance)
 * moonshine automatically adds Angular.js files and any js file under the static folder to the list of served karma files.
 * you can add testing libraries to `test/client/*.js` and they'll be added as well (for instance if you want to add expect.js or angular mocks, etc...)

 ###Gotchayas:
* Always add Components to the peerDependencies section of you package.json
* You need to define Component dependencies in settings.js module.exports.requiredComponents as well as in package.json

## Featured Components:
* [User authentication](https://github.com/Illniyar/moon-contrib-user) - user handling and authentication
  * [User local authentication](https://github.com/Illniyar/moon-contrib-user-local) - Username/password based authentication for moon-contrib-user

  * [User rememberme authentication](https://github.com/Illniyar/moon-contrib-user-rememberme) - Remember me token functionality for moon-contrib-user

  
Libraries/Frameworks used:

* [Express.js](http://expressjs.com/)
* [Mongoose](http://mongoosejs.com/)
* [Baucis](https://github.com/wprl/baucis)
* [Winston](https://github.com/flatiron/winston) (via [Lograp](https://github.com/Illniyar/lograp))
* [Angular.js](http://angularjs.org/)
* [Restangular](https://github.com/mgonto/restangular)

Philosophy:

* __Little magic, no generators__ - explicit is better than implicit (but always use reasonable defaults).
* __Lightweight and Modular__- components do only one thing, depend on as few components as possible and provide extensions points to allow other modules to integrate with it.
* __Best of breed__ - make using the most used projects/libraries/frameworks together easier.

License MIT:
http://opensource.org/licenses/MIT