marked.setOptions 
	color: true
ajax = (url, cb)->
	xhr = new XMLHttpRequest()
	xhr.open('GET',url)
	xhr.onload = ()->
		cb xhr.responseText
	xhr.send()
worker = cw {ajax:ajax}
class View extends Backbone.View
	el:$ '#cont'
	cur:'README'
	events:
		"click .navLink":'aClick'
	aClick:(e)->
		e.preventDefault()
		router.navigate e.target.id, {trigger:true}
		false
	render:->
		@$el.html "<p class='text-center'><i class='icon-spinner icon-spin icon-4x'></i>loading...</p>"
		unless typeof window.Worker is 'undefined'
			worker.ajax(cw.makeUrl("#{@cur}.md")).then (md)=>
				@$el.html(marked(md))
		else
			$('#cont').html """
		<p>Dosn't look like your browser supports web workers, you should upgrade...or just <a href='#' id='unfacncy' class='btn btn-danger '><i class="icon-arrow-down pull-left"></i>load</a> in an unfacy way</p>
		"""
			$('#unfacncy').on 'click', (e)=>
				e.preventDefault()
				$.ajax("#{@cur}.md").then (md)=>
					@$el.html(marked(md))
view = new View()
class Routes extends Backbone.Router
	routes:
		":page":'nav'
		"":'nav'
	nav:(page)->
		if page
			view.cur = page
		else
			view.cur = 'README'
		view.render()
router = new Routes()
Backbone.history.start()
