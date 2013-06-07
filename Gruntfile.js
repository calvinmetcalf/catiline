module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			browser: {
				options:{
					banner:'/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %>*/\n/*!(c)2013 Calvin Metcalf @license MIT https://github.com/calvinmetcalf/communist */\n/*!Includes Promiscuous (c)2013 Ruben Verborgh @license MIT https://github.com/RubenVerborgh/promiscuous*/\n/*!Includes Material from setImmediate Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola @license MIT https://github.com/NobleJS/setImmediate */\n',
					mangle: {
						except: ['Communist']
					}
				},
				src: 'dist/<%= pkg.name %>.js',
				dest: 'dist/<%= pkg.name %>.min.js'
			}
		},
		concat: {
		 
			browser: { 
				options: {
					banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %>*/\n/*!©2013 Calvin Metcalf @license MIT https://github.com/calvinmetcalf/communist */\n',
					seperator:";\n",
					footer : '})();}'
				},
				files: {'dist/<%= pkg.name %>.js':['src/IE.js','src/setImmediate.js','src/promiscuous.js','src/all.js','src/utils.js','src/worker.single.js','src/worker.general.js','src/worker.multiuse.js','src/worker.object.js','src/queue.js','src/worker.reducer.js','src/mapreduce.incremental.js','src/mapreduce.nonincremental.js','src/wrapup.js']}
			}
		},mocha_phantomjs: {
		all: {
			options: {
				urls: [
					"http://localhost:8000/test/index.html",
					"http://localhost:8000/test/index.min.html"
				]
			}
		}
	},
		connect: {
			server: {
				options: {
					port: 8000,
					base: '.'
				}
			}
		},
	jshint: {
		options:{
			multistr:true,
			expr:true,
			trailing:true,
			eqeqeq:true,
			curly:true
		},
		beforeconcat: ['src/*.js'],
		afterconcat: ['dist/communist.js']
	},
	"saucelabs-mocha":{
		all:{
			options:{
				username:"calvinmetcalf",
				key: "f8fc3a7c-9529-4a04-861d-91614ec7afd2",
				concurrency:3,
				browsers: [{browserName: "chrome",
platform: "OS X 10.8",
},{browserName: "safari",
platform: "OS X 10.8",
version:'6'
}, {
browserName: 'chrome',
platform: 'XP'
}, {
browserName: 'chrome',
platform: 'linux'
}, {
browserName: 'internet explorer',
platform: 'WIN8',
version: '10'
}, {
browserName: 'opera',
platform: 'linux',
version: '12'
}],
				urls:[
					"http://localhost:8000/test/index.html",
					"http://localhost:8000/test/index.min.html"
				]
			}
		}	
	},
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
 grunt.loadNpmTasks('grunt-contrib-concat');
 grunt.loadNpmTasks('grunt-simple-mocha');
 grunt.loadNpmTasks('grunt-contrib-connect');
 grunt.loadNpmTasks('grunt-mocha-phantomjs');
 grunt.loadNpmTasks('grunt-contrib-jshint');
 grunt.loadNpmTasks('grunt-saucelabs');
	// Default task(s).
	grunt.registerTask('sauce',['server','saucelabs-mocha']);
	grunt.registerTask('server',['connect']);
	grunt.registerTask('browser',['concat:browser','uglify:browser']);
	grunt.registerTask('lint',['jshint:afterconcat']);
grunt.registerTask('test', ['connect', 'mocha_phantomjs']);
	grunt.registerTask('default', ['browser','lint','sauce']);

};
