Communist = (fun) ->
	return  if typeof fun isnt "function"
	if window.Worker
		window.URL = window.URL or window.webkiURL
		body = "var f =  #{ fun.toString() };self.addEventListener('message', function(e) {try{self.postMessage({body:f.apply(null, e.data.body),cb:e.data.cb})}catch(err){self.postMessege({error:err,cb:e.data.cb})}})"
		blob = new Blob [body],
			type: "text/javascript"
		bUrl = window.URL.createObjectURL(blob)
		_worker = new Worker(bUrl)
		@CBs = {}
		@send = (data..., cb) =>
			id = ("" + Math.random()).slice(2)
			@CBs[id] = cb
			_worker.postMessage {body:data,cb : id}
			_worker.onmessage = (e) =>
				if  e.data.body
					@CBs[e.data.cb] null, e.data.body
					delete @CBs[e.data.cb] 
				else if e.data.error
					CBs[e.data.cb] e.data.error
					delete @CBs[e.data.cb] 
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