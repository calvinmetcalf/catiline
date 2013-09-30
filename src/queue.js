Catiline.Queue = function CatilineQueue(obj, n, dumb) {
	const self = this;
	self.__batchcb__ = {};
	self.__batchtcb__ = {};
	self.batch = function (cb) {
		if (typeof cb === 'function') {
			self.__batchcb__.__cb__ = cb;
			return self.__batchcb__;
		}
		else {
			return clearQueue(cb);
		}
	};
	self.batchTransfer = function (cb) {
		if (typeof cb === 'function') {
			self.__batchtcb__.__cb__ = cb;
			return self.__batchtcb__;
		}
		else {
			return clearQueue(cb);
		}
	};
	const workers = [];
	let numIdle = 0;
	const idle = [];
	let que = [];
	let queueLen = 0;
	while (numIdle < n) {
		workers[numIdle] = new Catiline.Worker(obj);
		idle.push(numIdle);
		numIdle++;
	}
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
	var batchFire = function (eventName, data) {
		workers.forEach(function (worker) {
			worker.fire(eventName, data);
		});
		return self;
	};
	self.fire = function (eventName, data) {
		workers[~~ (Math.random() * n)].fire(eventName, data);
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

	function keyFunc(k) {
		return function (data, transfer) {
			return doStuff(k, data, transfer);
		};
	}

	function keyFuncBatch(k) {
		return function (array) {
			return Catiline.all(array.map(function (data) {
				return doStuff(k, data);
			}));
		};
	}

	function keyFuncBatchCB(k) {
		return function (array) {
			const self = this;
			return Catiline.all(array.map(function (data) {
				return doStuff(k, data).then(self.__cb__);
			}));
		};
	}

	function keyFuncBatchTransfer(k) {
		return function (array) {
			return Catiline.all(array.map(function (data) {
				return doStuff(k, data[0], data[1]);
			}));
		};
	}

	function keyFuncBatchTransferCB(k) {
		return function (array) {
			const self = this;
			return Catiline.all(array.map(function (data) {
				return doStuff(k, data[0], data[1]).then(self.__cb__);
			}));
		};
	}
	for (let key in obj) {
		self[key] = keyFunc(key);
		self.batch[key] = keyFuncBatch(key);
		self.__batchcb__[key] = keyFuncBatchCB(key);
		self.batchTransfer[key] = keyFuncBatchTransfer(key);
		self.__batchtcb__[key] = keyFuncBatchTransferCB(key);
	}

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

	function doStuff(key, data, transfer) { //srsly better name!
		const promise = Catiline.deferred();
		if (dumb) {
			promise.promise.cancel = function(reason){
				return promise.reject(reason);
			};
			workers[~~ (Math.random() * n)][key](data, transfer).then(function(v){
				return promise.resolve(v);
			},function(v){
				return promise.reject(v);
			});
			return promise.promise;
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
		}
		else if (queueLen || !numIdle) {
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
		return Catiline.all(workers.map(function (w) {
			return w._close();
		}));
	};
	if (!('close' in self)) {
		self.close = self._close;
	}
};
Catiline.queue = function (obj, n, dumb) {
	return new Catiline.Queue(obj, n, dumb);
};
