function makeActualKeyFuncs(resolvePromises, self) {
	return {
		keyFunc: function(k) {
			return function(data, transfer) {
				return resolvePromises(k, data, transfer);
			};
		},
		keyFuncBatch: function(k) {
			return function(array) {
				return catiline.all(array.map(function(data) {
					return resolvePromises(k, data);
				}));
			};
		},
		keyFuncBatchCB: function(k) {
			return function(array) {
				return catiline.all(array.map(function(data) {
					return resolvePromises(k, data).then(self.__cb__);
				}));
			};
		},
		keyFuncBatchTransfer: function(k) {
			return function(array) {
				return catiline.all(array.map(function(data) {
					return resolvePromises(k, data[0], data[1]);
				}));
			};
		},
		keyFuncBatchTransferCB: function(k) {
			return function(array) {
				return catiline.all(array.map(function(data) {
					return resolvePromises(k, data[0], data[1]).then(self.__cb__);
				}));
			};
		}
	};
}
function makeKeyFuncs(resolvePromises, self, obj){
	const funcs = makeActualKeyFuncs(resolvePromises, self);
	for (let key in obj) {
		self[key] = funcs.keyFunc(key);
		self.batch[key] = funcs.keyFuncBatch(key);
		self.__batchcb__[key] = funcs.keyFuncBatchCB(key);
		self.batchTransfer[key] = funcs.keyFuncBatchTransfer(key);
		self.__batchtcb__[key] = funcs.keyFuncBatchTransferCB(key);
	}
}
function addBatchEvents(self, workers, n){
	self.on = function (eventName, func, context) {
		workers.forEach(function (worker) {
			worker.on(eventName, func, context);
		});
		return self;
	};
	self.off = function (eventName, func, context) {
		workers.forEach(function (worker) {
			worker.off(eventName, func, context);
		});
		return self;
	};
	self.fire = function (eventName, data) {
		workers[~~ (Math.random() * n)].fire(eventName, data);
		return self;
	};
}
function makeUnmanaged(workers, n){
	return function(key, data, transfer, promise){
		promise.promise.cancel = function(reason){
			return promise.reject(reason);
		};
		workers[~~ (Math.random() * n)][key](data, transfer).then(function(v){
			return promise.resolve(v);
		},function(v){
			return promise.reject(v);
		});
		return promise.promise;
	};
}
function makeQueueWorkers(n,idle,obj){
	const workers = [];
	let numIdle = -1;
	while (++numIdle < n) {
		workers[numIdle] = new catiline.Worker(obj);
		idle.push(numIdle);
	}
	return workers;
}
function CatilineQueue(obj, n, dumb) {
	const self = this;
	let numIdle = n;
	const idle = [];
	let que = [];
	let queueLen = 0;
	const workers = makeQueueWorkers(n,idle,obj);
	addBatchEvents(self, workers, n);
	var batchFire = function (eventName, data) {
		workers.forEach(function (worker) {
			worker.fire(eventName, data);
		});
		return self;
	};
	
	self.batch.fire = batchFire;
	self.batchTransfer.fire = batchFire;

	function clearQueue(mgs) {
		mgs = mgs || 'canceled';
		queueLen = 0;
		const oQ = que;
		que = [];
		oQ.forEach(function (p) {
			p[3].reject(mgs);
		});
		return self;
	}
	self.clearQueue = clearQueue;
	makeKeyFuncs(resolvePromises, self, obj);
	

	function done(num) {
		if (queueLen) {
			let data = que.shift();
			queueLen--;
			workers[num][data[0]](data[1], data[2]).then(function (d) {
				done(num);
				data[3].resolve(d);
			}, function (d) {
				done(num);
				data[3].reject(d);
			});
		}
		else {
			numIdle++;
			idle.push(num);
		}
	}
	let resolveUnmanagedPromises;
	if(dumb){
		resolveUnmanagedPromises = makeUnmanaged(workers, n);
	}
	function resolvePromises(key, data, transfer) { //srsly better name!
		const promise = catiline.deferred();
		if (dumb) {
			return resolveUnmanagedPromises(key, data, transfer,promise);
		}
		if (!queueLen && numIdle) {
			let num = idle.pop();
			numIdle--;
			promise.promise.cancel = function(reason){
				return promise.reject(reason);
			};
			workers[num][key](data, transfer).then(function (d) {
				done(num);
				promise.resolve(d);
			}, function (d) {
				done(num);
				promise.reject(d);
			});
		} else if (queueLen || !numIdle) {
			const queueItem = [key, data, transfer, promise];
			promise.promise.cancel = function(reason){
				const loc = que.indexOf(queueItem);
				if(loc>-1){
					que.splice(loc,1);
					queueLen--;
				}
				return promise.reject(reason);
			};
			queueLen = que.push(queueItem);
		}
		return promise.promise;
	}
	self._close = function () {
		return catiline.all(workers.map(function (w) {
			return w._close();
		}));
	};
	if (!('close' in self)) {
		self.close = self._close;
	}
}
CatilineQueue.prototype.__batchcb__ = {};
CatilineQueue.prototype.__batchtcb__ = {};
CatilineQueue.prototype.batch = function (cb) {
	if (typeof cb === 'function') {
		this.__cb__ = cb;
		return this.__batchcb__;
	}
	else {
		return this.clearQueue(cb);
	}
};
CatilineQueue.prototype.batchTransfer = function (cb) {
	if (typeof cb === 'function') {
		this.__batchtcb__.__cb__ = cb;
		return this.__batchtcb__;
	}
	else {
		return this.clearQueue(cb);
	}
};
catiline.Queue = CatilineQueue;
catiline.queue = function (obj, n, dumb) {
	return new catiline.Queue(obj, n, dumb);
};
