class Socialist
	constructor : (@_func)->
	send : (data..., cb) =>
		window.send = (m)->
			cb null, m
		try
			cb null, @_func(data...)
		catch err
			cb err
		true

	close : ->
		_func = undefined
		true
	true
window.Socialist = Socialist