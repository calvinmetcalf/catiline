class Communist 
	constructor : (fun) ->
		window.URL = window.URL or window.webkiURL
		body = "var send;var _f =  #{ fun };self.addEventListener('message', function(_e) {send = function(data){self.postMessage({messege:data,cb:_e.data.cb})};try{self.postMessage({body:_f.apply(null, _e.data.body),cb:_e.data.cb})}catch(_err){self.postMessege({error:_err,cb:_e.data.cb})}})"
		blob = new Blob [body],
			type: "text/javascript"
		bUrl = window.URL.createObjectURL(blob)
		@_worker = new Worker(bUrl)
		@
	CBs : {}
	send : (data..., cb) =>
		id = ("" + Math.random()).slice(2)
		@CBs[id] = cb
		@_worker.postMessage {body:data,cb : id}
		@_worker.onmessage = (e) =>
			if  e.data.body
				@CBs[e.data.cb] null, e.data.body
				delete @CBs[e.data.cb]
			else if e.data.messege
				@CBs[e.data.cb] null, e.data.messege
			else if e.data.error
				CBs[e.data.cb] e.data.error
				delete @CBs[e.data.cb] 
			true
		@_worker.onerror = (e) ->
			cb e
			true
	start : (cb)=>
		@send(cb)

		true

	close : () ->
		@_worker.terminate()
		true
	true 

window.Communist = Communist