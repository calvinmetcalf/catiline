class Socialist
	constructor : (fun)->
		if fun
			@_func = fun
		else
			@_db = {}
			@_db._add = (name, func)->
				@_db[name]=func
				true
			@_db._rm = (name)->
				delete @_db[name]
				true
			@_func = (name,args...)->
				@_db[name].apply null, args
	CBs : {}
	send : (data..., cb) =>
		self = {}
		self.send = (m)->
			cb null, m
		#these two are origionally from https://developer.mozilla.org/en-US/docs/DOM/window.setTimeout#A_possible_solution but modified
		self.setInterval = (vCallback, nDelay, _args...) -> 
			_func = ()=>
				vCallback.apply @, _args
			window.setInterval _func, nDelay
		self.setTimeout = (vCallback, nDelay, _args...) -> 
			_func = ()=>
				vCallback.apply @, _args
			window.setInterval _func, nDelay
		try
			cb null, @_func.apply(self,data)
			return true
		catch err
			cb err
			return false
		true
	start : (cb)=>
		@send(cb)

	close : ->
		_func = undefined
		true
	true
	if @_db
		add : (method, func, cb=()->true)->
			@send("_add",method,(func.toString()),cb)
			true
		remove : (method,cb=()->true)->
			@send("_rm",method,cb)
			true
window.Socialist = Socialist