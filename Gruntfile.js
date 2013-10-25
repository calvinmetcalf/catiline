var UglifyJS = require("uglify-js");
var defs = require('defs');
module.exports = function(grunt) {
	function runDefs(file){
		var input = grunt.file.read(file);
		var defit = defs(input,{'disallowUnknownReferences':false});
		if(defit.errors){
			console.log(defit.errors);
			throw defit.errors;
		}
		grunt.file.write(file,defit.src);
	};
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			all: {
				options:{
					banner:'/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>*/\n/*!(c)2013 Calvin Metcalf @license MIT https://github.com/calvinmetcalf/catiline */\n/*!Includes Promiscuous (c)2013 Ruben Verborgh @license MIT https://github.com/RubenVerborgh/promiscuous*/\n/*!Includes Material from setImmediate Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola @license MIT https://github.com/NobleJS/setImmediate */\n',
					mangle: {
						except: ['Catiline','CatilineQueue','Promise','Deferred']
					},
					 report: 'gzip'
				},
				src: 'dist/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		concat: {
			browser: { 
				options: {
					banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>*/\n/*!©2013 Calvin Metcalf @license MIT https://github.com/calvinmetcalf/catiline */\n',
					seperator:";\n",
					footer : 'catiline.version = \'<%= pkg.version %>\';\n})(this);}'
				},
				files: {'dist/<%= pkg.name %>.js':['src/IE.js','src/nextTick.js','src/promise.js','src/utils.js','src/worker.js','src/events.js','src/console.js','src/core.js','src/queue.js','src/wrapup.js']}
			}
		},
		mocha_phantomjs: {
			all: {
				options: {
					urls: [
						"http://"+process.env.IP+":8080/test/index.html",
						"http://"+process.env.IP+":8080/test/index.min.html",
						"http://"+process.env.IP+":8080/test/index.leg.html",
						"http://"+process.env.IP+":8080/test/index.amd.html"
					]
				}
			}
		},
		connect: {
			server: {
				options: {
					port: 8080,
					base: '.'
				}
			}
		},
	jshint: {
		options:{
			jshintrc: "./.jshintrc"
		},
		beforeconcat: ['src/*.js'],
		afterconcat: ['dist/catiline.js']
	},
	"saucelabs-mocha":{
		options:{
			username:"calvinmetcalf",
			key: "f288b74b-589a-4fb4-9e65-d8b6ddd09d0e",
			concurrency:3,
			build: process.env.TRAVIS_JOB_ID
		},
		big:{
			options:{
				browsers: [
					
					{
						browserName: 'firefox',
						platform: 'linux',
						version: '22'
					},{
						browserName: 'firefox',
						platform: 'linux',
						version: '17'
					},{
						browserName: 'opera',
						platform: 'linux',
						version: '12'
					},{
						browserName: "chrome",
						platform: "OS X 10.8"
					},{
						browserName: "safari",
						platform: "OS X 10.8",
						version:'6'
					},{
						browserName: "safari",
						platform: "OS X 10.6",
						version:'5'
					},{
						browserName: "iphone",
						platform: "OS X 10.8",
						version:'6'
					}, {
						browserName: 'internet explorer',
						platform: 'WIN8',
						version: '10'
					},{
						browserName: 'safari',
						platform: 'win7',
						version: '5'
					},{
						browserName: 'chrome',
						platform: 'XP'
					}
				],
				urls:[
					"http://127.0.0.1:8080/test/index.html",
					"http://127.0.0.1:8080/test/index.min.html",
					"http://127.0.0.1:8080/test/index.amd.html",
				]
			}
		},
		shim:{
			options:{
				browsers: [
					{
						browserName: 'internet explorer',
						platform: 'WIN8',
						version: '10'
					},{
						browserName: 'safari',
						platform: 'win7',
						version: '5'
					}
				],
			urls:[
					"http://127.0.0.1:8080/test/index.shim.html"
				]
			}
		},
		legacy:{
			options:{
				browsers: [
					{
						browserName: 'internet explorer',
						platform: 'WIN7',
						version: '9'
					},{
						browserName: 'chrome',
						platform: 'linux'
					},{
						browserName: 'opera',
						platform: 'xp',
						version:'11'
					}
				],
			urls:[
					"http://127.0.0.1:8080/test/index.leg.html"
				]
			}
		}
	}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-mocha-phantomjs');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-saucelabs');
	grunt.registerTask('defsAll',function(){
		runDefs('dist/catiline.js');
	});
	grunt.registerTask('sauce',['connect','saucelabs-mocha:big','saucelabs-mocha:shim','saucelabs-mocha:legacy']);
	grunt.registerTask('server',['connect']);
	grunt.registerTask('browser',['concat:browser','defsAll','ugly']);
	grunt.registerTask('lint',['jshint:afterconcat']);
	grunt.registerTask('testing', ['connect', 'mocha_phantomjs']);
	grunt.registerTask('test', ['lint','sauce']);
	grunt.registerTask('build', ['browser']);
    grunt.registerTask('ugly', ['uglify']);
	grunt.registerTask('default', ['build','test']);
	grunt.registerTask('c9', ['build','lint','testing']);

};
