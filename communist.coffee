Communist = (fun) ->
	return  if typeof fun isnt "function"
	if window.Worker
		window.URL = window.URL or window.webkiURL
		body = "var f =  #{ fun.toString() };self.addEventListener('message', function(e) {self.postMessage(f.apply(null, e.data))})"
		blob = new Blob [body],
			type: "text/javascript"
		bUrl = window.URL.createObjectURL(blob)
		_worker = new Worker(bUrl)
		@send = (data..., cb) ->
			_worker.postMessage data
			_worker.onmessage = (e) ->
				cb null, e.data
				true
			_worker.onerror = (e) ->
				cb e
				true

			true

		@close = ->
			_worker.terminate()
			true
		true 
	else
		_func = fun
		@send = (data..., cb) ->
			try
				cb null, _func(data...)
			catch err
				cb err
			true

		@close = ->
			_func = undefined
			true
		true

window.communist = (fun) ->
	new Communist(fun)