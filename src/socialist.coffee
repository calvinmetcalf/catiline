class Socialist
	constructor : (@_func)->
	CBs : {}
	send : (data..., cb) =>
		self = {}
		self.send = (m)->
			cb null, m
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