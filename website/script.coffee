marked.setOptions 
	color: true

$.ajax('README.md').then (md)->
	$('#cont').html(marked(md.slice(45)))
