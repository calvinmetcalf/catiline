function makeConsole(msg) {
	if (typeof console !== 'undefined') {
		let method = console[msg[0]] ? msg[0] : 'log';
		if (typeof console[method].apply === 'undefined') {
			console[method](msg[1].join(' '));
		}
		else {
			console[method].apply(console, msg[1]);
		}
	}
}
function makeWorkerConsole(context){
	function makeConsole(method) {
		return function() {
			const len = arguments.length;
			const out = [];
			let i = 0;
			while (i < len) {
				out.push(arguments[i]);
				i++;
			}
			context.fire('console', [method, out]);
		};
	}
	['log', 'debug', 'error', 'info', 'warn', 'time', 'timeEnd'].forEach(function(v) {
		console[v] = makeConsole(v);
	});
}