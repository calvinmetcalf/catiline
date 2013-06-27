marked.setOptions 
	color: true
readmeSetUp=->
	$('#api').on 'click',(e)->
		e.preventDefault()
		setUp('API')
		false
setUp=(page)->
	$('#cont').html "<p class='text-center'><i class='icon-spinner icon-spin icon-4x'></i>loading...</p>"
	unless typeof window.Worker is 'undefined'
		communist.ajax("#{page}.md",(d)->
			d
		,true).then (md)->
			$('#cont').html(marked(md))
			readmeSetUp() if page is 'README'
	else
		$('#cont').html """
		<p>Dosn't look like your browser supports web workers, you should upgrade...or just <a href='#' id='unfacncy' class='btn btn-danger '><i class="icon-arrow-down pull-left"></i>load</a> in an unfacy way</p>
		"""
		$('#unfacncy').on 'click', (e)->
			e.preventDefault()
			$.ajax("#{page}.md").then (md)->
				$('#cont').html(marked(md))
				readmeSetUp() if page is 'README'
			false
setUp('README')