catiline.Worker = function Catiline(obj) {
		if(typeof obj === 'function'){
			obj = {
				data:obj
			};
		}
		const __codeWord__='com.catilinejs.'+(catiline._hasWorker?'iframe':'worker')+Math.random();
		const listeners = {};
		const self = this;
		self.on = function (eventName, func, scope) {
			scope = scope || self;
			if (eventName.indexOf(' ') > 0) {
				eventName.split(' ').map(function (v) {
					return self.on(v, func, scope);
				}, this);
				return self;
			}
			if (!(eventName in listeners)) {
				listeners[eventName] = [];
			}
			listeners[eventName].push(function (a) {
				func.call(scope, a);
			});
			return self;
		};
	
		function _fire(eventName, data) {
			if (eventName.indexOf(' ') > 0) {
				eventName.split(' ').forEach(function (v) {
					_fire(v, data);
				});
				return self;
			}
			if (!(eventName in listeners)) {
				return self;
			}
			listeners[eventName].forEach(function (v) {
				v(data);
			});
			return self;
		}
		self.fire = function (eventName, data, transfer) {
			if(catiline._noTransferable){
				worker.postMessage([[eventName], data]);
			}else{
				worker.postMessage([[eventName], data], transfer);
			}
			
			return self;
		};
		self.off = function (eventName, func) {
			if (eventName.indexOf(' ') > 0) {
				eventName.split(' ').map(function (v) {
					return self.off(v, func);
				});
				return self;
			}
			if (!(eventName in listeners)) {
				return self;
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
			return self;
		};

		const promises = [];
		const rejectPromises = function (msg) {
			if (typeof msg !== 'string' && 'preventDefault' in msg) {
				msg.preventDefault();
				msg = msg.message;
			}
			promises.forEach(function (p) {
				if (p) {
					p.reject(msg);
				}
			});
		};
		obj.__codeWord__='"'+__codeWord__+'"';
		if (!('initialize' in obj)) {
			if ('init' in obj) {
				obj.initialize = obj.init;
			}
			else {
				obj.initialize = function () {};
			}
		}
		let fObj = '{\n\t';
		const keyFunc = function (key) {
			const out = function (data, transfer) {
				const i = promises.length;
				promises[i] = catiline.deferred();
				if(catiline._noTransferable){
					worker.postMessage([[__codeWord__, i], key, data]);
				}else{
					worker.postMessage([[__codeWord__, i], key, data], transfer);
				}
				return promises[i].promise;
			};
			return out;
		};
		let i = 0;
		for (let key in obj) {
			if (i !== 0) {
				fObj = fObj + ',\n\t';
			}
			else {
				i++;
			}
			fObj = fObj + key + ':' + obj[key].toString();
			self[key] = keyFunc(key);
		}
		fObj = fObj + '}';
		const worker = catiline.makeWorker($$fObj$$,__codeWord__);
		worker.onmessage = function (e) {
			_fire('message', e.data[1]);
			if (e.data[0][0] === __codeWord__) {
				promises[e.data[0][1]].resolve(e.data[1]);
				promises[e.data[0][1]] = 0;
			}
			else {
				_fire(e.data[0][0], e.data[1]);
			}
		};
		self.on('error',rejectPromises);
		worker.onerror =function (e) {
			_fire('error', e);
		};
		self.on('console', function (msg) {
			console[msg[0]].apply(console, msg[1]);
		});
		self._close = function () {
			worker.terminate();
			rejectPromises('closed');
			return catiline.resolve();
		};
		if (!('close' in self)) {
			self.close = self._close;
		}
	};
catiline.worker = function (obj){
	return new catiline.Worker(obj);
};
