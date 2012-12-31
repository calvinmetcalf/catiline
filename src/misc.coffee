window.communist = (fun) ->
	if window.Worker
		if fun
			new Communist(fun)
		else
			new Communist()
	else
		if fun
			new Socialist(fun)
		else
			new Socialist()