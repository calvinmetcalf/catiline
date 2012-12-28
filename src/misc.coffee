window.communist = (fun) ->
	if window.Worker
		new Communist(fun.toString())
	else
		new Socialist(fun)