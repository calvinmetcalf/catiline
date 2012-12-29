class Socialist
	constructor : (@_func)->
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

	close : ->
		_func = undefined
		true
	true
window.Socialist = Socialist