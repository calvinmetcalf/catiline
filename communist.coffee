Communist = (fun) ->
	return  if typeof fun isnt "function"
	if Worker
		window.URL = window.URL or window.webkiURL
		func = fun.toString()
		body = "var f = " + func + ";self.addEventListener('message', function(e) {self.postMessage(f.apply(null, e.data))})"
		blob = new Blob [body],
			type: "text/javascript"
		bUrl = window.URL.createObjectURL(blob)
		_worker = new Worker(bUrl)
		@send = (data..., cb) ->
			_worker.postMessage data
			_worker.onmessage = (e) ->
				cb e.data
				true

			true

		@close = ->
			_worker.terminate()
			true
		true 
	else
		_func = fun
		@send = (data..., cb) ->
			cb _func(data...)
			true

		@close = ->
			true
		true

communist = (fun) ->
	new Communist(fun)