communist.Worker = function Communist(obj) {
		if(typeof obj === 'function'){
			obj = {
				data:obj
			};
		}
		if(typeof Worker === 'undefined'||typeof fakeLegacy !== 'undefined'){
			return new FakeCommunist(obj);
		}
		var listeners = {};
		var w = this;
		w.on = function (eventName, func, scope) {
			scope = scope || w;
			if (eventName.indexOf(' ') > 0) {
				eventName.split(' ').map(function (v) {
					return w.on(v, func, scope);
				}, this);
				return w;
			}
			if (!(eventName in listeners)) {
				listeners[eventName] = [];
			}
			listeners[eventName].push(function (a) {
				func.call(scope, a);
			});
			return w;
		};
	
		function _fire(eventName, data) {
			if (eventName.indexOf(' ') > 0) {
				eventName.split(' ').forEach(function (v) {
					_fire(v, data);
				});
				return w;
			}
			if (!(eventName in listeners)) {
				return w;
			}
			listeners[eventName].forEach(function (v) {
				v(data);
			});
			return w;
		}
		w.fire = function (eventName, data, transfer) {
			!communist._noTransferable ? worker.postMessage([
				[eventName], data], transfer) : worker.postMessage([
				[eventName], data]);
			return w;
		};
		w.off = function (eventName, func) {
			if (eventName.indexOf(' ') > 0) {
				eventName.split(' ').map(function (v) {
					return w.off(v, func);
				});
				return w;
			}
			if (!(eventName in listeners)) {
				return w;
			}
			else if (!func) {
				delete listeners[eventName];
			}
			else {
				if (listeners[eventName].indexOf(func) > -1) {
					if (listeners[eventName].length > 1) {
						delete listeners[eventName];
					}
					else {
						listeners[eventName].splice(listeners[eventName].indexOf(func), 1);
					}
				}
			}
			return w;
		};
		var i = 0;
		var promises = [];
		var rejectPromises = function (msg) {
			if (typeof msg !== "string" && 'preventDefault' in msg) {
				msg.preventDefault();
				msg = msg.message;
			}
			promises.forEach(function (p) {
				if (p) {
					p.reject(msg);
				}
			});
		};
	
		if (!("initialize" in obj)) {
			if ('init' in obj) {
				obj.initialize = obj.init;
			}
			else {
				obj.initialize = function () {};
			}
		}
		var fObj = "{";
		var keyFunc = function (key) {
			var out = function (data, transfer) {
				var i = promises.length;
				promises[i] = communist.deferred();
				!communist._noTransferable ? worker.postMessage([
					['com.communistjs', i], key, data], transfer) : worker.postMessage([
					['com.communistjs', i], key, data]);
				return promises[i].promise;
			};
			return out;
		};
		for (var key in obj) {
			if (i !== 0) {
				fObj = fObj + ",";
			}
			else {
				i++;
			}
			fObj = fObj + key + ":" + obj[key].toString();
			w[key] = keyFunc(key);
		}
		fObj = fObj + "}";
		var worker = communist.makeWorker($$fObj$$);
		worker.onmessage = function (e) {
			_fire('message', e.data[1]);
			if (e.data[0][0] === 'com.communistjs') {
				promises[e.data[0][1]].resolve(e.data[1]);
				promises[e.data[0][1]] = 0;
			}
			else {
				_fire(e.data[0][0], e.data[1]);
			}
		};
		worker.onerror = function (e) {
			rejectPromises(e);
			_fire('error', e);
		};
		w.on('console', function (msg) {
			console[msg[0]].apply(console, msg[1]);
		});
		w._close = function () {
			worker.terminate();
			rejectPromises("closed");
			return communist.resolve();
		};
		if (!('close' in w)) {
			w.close = w._close;
		}
	};
communist.worker = function (obj){
	return new communist.Worker(obj);
};
