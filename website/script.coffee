marked.setOptions 
	color: true

setUp=()->
	$('#cont').html "<p class='text-center'><i class='icon-spinner icon-spin icon-4x'></i>loading...</p>"
setUp()
if typeof window.Worker is 'function'
	setUp()
	communist.ajax('README.md',(d)->
		d.slice(66)
	,true).then (md)->
		$('#cont').html(marked(md))
else
	$('#cont').html """
	<p>Dosn't look like your browser supports web workers, you should upgrade...or just <a href='#' id='unfacncy' class='btn btn-danger '><i class="icon-arrow-down pull-left"></i>load</a> in an unfacy way</p>
	"""
	$('#unfacncy').on 'click', (e)->
		e.preventDefault()
		setUp()
		$.ajax('README.md').then (md)->
			$('#cont').html(marked(md.slice(45)))
		false
