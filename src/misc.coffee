window.communist = (fun) ->
	if window.Worker
		if fun
			new Communist(fun)
		else
			new Communist()
	else
		new Socialist(fun)