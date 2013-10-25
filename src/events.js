function addEvents(context, msg) {
	const listeners = {};
	let sendMessage;
	if(typeof __self__ !== 'undefined'){
		sendMessage = __self__.postMessage;
	}else if (msg) {
		sendMessage = msg;
	}
	context.on = function(eventName, func, scope) {
		scope = scope || context;
		if (eventName.indexOf(' ') > 0) {
			eventName.split(' ').map(function(v) {
				return context.on(v, func, scope);
			}, this);
			return context;
		}
		if (!(eventName in listeners)) {
			listeners[eventName] = [];
		}
		const newFunc = function(a) {
			func.call(scope, a, scope);
		};
		newFunc.orig = func;
		listeners[eventName].push(newFunc);
		return context;
	};
	context.one = function(eventName, func, scope) {
		scope = scope || context;

		function ourFunc(a) {
			context.off(eventName, ourFunc);
			func.call(scope, a, scope);
		}
		return context.on(eventName, ourFunc);
	};

	context.trigger = function(eventName, data) {
		if (eventName.indexOf(' ') > 0) {
			eventName.split(' ').forEach(function(v) {
				context.trigger(v, data);
			});
			return context;
		}
		if (!(eventName in listeners)) {
			return context;
		}
		listeners[eventName].forEach(function(v) {
			v(data);
		});
		return context;
	};
	context.fire = function(eventName, data, transfer) {
		sendMessage([[eventName],data],transfer);
		return context;
	};
	context.off = function(eventName, func) {
		if (eventName.indexOf(' ') > 0) {
			eventName.split(' ').map(function(v) {
				return context.off(v, func);
			});
			return context;
		}
		if (!(eventName in listeners)) {
			return context;
		}
		else {
			if (func) {
				listeners[eventName] = listeners[eventName].map(function(a) {
					if (a.orig === func) {
						return false;
					}
					else {
						return a;
					}
				}).filter(function(a) {
					return a;
				});
			}
			else {
				delete listeners[eventName];
			}
		}
		return context;
	};
}