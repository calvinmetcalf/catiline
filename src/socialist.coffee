

class Socialist
	constructor : (@_func)->
	CBs : {}
	send : (data..., cb) =>
		self = {}
		self.send = (m)->
			cb null, m
		self.setTimeout = (vCallback, nDelay) -> #, argumentToPass1, argumentToPass2, etc.
			__nativeST__ = window.setTimeout
			oThis = this
			aArgs = Array::slice.call(arguments_, 2)
			__nativeST__ (if vCallback instanceof Function then ->
				vCallback.apply oThis, aArgs
			else vCallback), nDelay
		self.setInterval = (vCallback, nDelay) -> #, argumentToPass1, argumentToPass2, etc.
			__nativeSI__ = window.setInterval
			oThis = this
			aArgs = Array::slice.call(arguments_, 2)
			__nativeSI__ (if vCallback instanceof Function then ->
				vCallback.apply oThis, aArgs
			else vCallback), nDelay
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