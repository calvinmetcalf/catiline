module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      browser: {
        options:{
          banner:'/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %>*/\n/*!©2013 Calvin Metcalf @license MIT https://github.com/calvinmetcalf/communist */\n/*!Includes Promiscuous ©2013 Ruben Verborgh @license MIT https://github.com/RubenVerborgh/promiscuous*/\n',
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
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %>*/\n/*!©2013 Calvin Metcalf @license MIT https://github.com/calvinmetcalf/communist */\n(function(){\n"use strict";\n',
          seperator:";\n"
        },
        files: {'dist/<%= pkg.name %>.js':['src/promiscuous.js','src/top.browser.js','src/<%= pkg.name %>.js','src/bottom.browser.js']}
      },
      node:{
        files: {'lib/<%= pkg.name %>.js':['src/top.node.js','src/<%= pkg.name %>.js','src/bottom.node.js']}
    }
    },
    simplemocha:{
      options: {
        globals: ['console'],
        ui: "bdd",
        timeout: 20000
      },
      all: { src: 'test/node-test.js' }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
 grunt.loadNpmTasks('grunt-contrib-concat');
 grunt.loadNpmTasks('grunt-simple-mocha');
  // Default task(s).
  grunt.registerTask('browser',['concat:browser','uglify:browser']);
  grunt.registerTask('node',['concat:node']);
  grunt.registerTask('test', ['concat:node','simplemocha']);
  grunt.registerTask('default', ['browser','node']);

};