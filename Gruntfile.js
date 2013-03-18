module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      browser: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    concat: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        seperator:";\n"
      },
      browser: {
        files: {'dist/<%= pkg.name %>.js':['src/top.browser.js','src/<%= pkg.name %>.js','src/bottom.browser.js']}
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