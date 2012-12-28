fs = require 'fs'
coffee = require 'coffee-script'
uglifyjs = require 'uglify-js' 

task 'build', 'build it', () ->
	a = ["communist","socialist","misc"].map (nom)->
		return fs.readFileSync "./src/#{nom}.coffee", 'utf8'
	fs.writeFile './communist.js', coffee.compile a.join("\n")
	console.log "compliled"

###
task 'min', 'build it small', () ->
	invoke 'build'
	fs.readFile './communist.coffee', 'utf8', (e,d)->
		unless e
			j = coffee.compile d
			ast = uglifyjs.parse j
			ast.figure_out_scope();
			ast.compute_char_frequency();
			ast.mangle_names();
			fs.writeFile './communist.min.js', ast.print_to_string()
			console.log "minified"
	###