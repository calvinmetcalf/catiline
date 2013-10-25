function Catiline(obj) {
	if (typeof obj === 'function') {
		obj = {
			data: obj
		};
	}
	const codeWord = 'com.catilinejs.' + (Catiline._hasWorker ? 'iframe' : 'worker') + Math.random();
	const self = this;
	const promises = [];
	addEvents(self, function(data, transfer) {
		if (catiline._noTransferable) {
			worker.postMessage(data);
		}
		else {
			worker.postMessage(data, transfer);
		}
	});
	const rejectPromises = function(msg) {
		if (typeof msg !== 'string' && 'preventDefault' in msg) {
			msg.preventDefault();
			msg = msg.message;
		}
		promises.forEach(function(p) {
			if (p) {
				p.reject(msg);
			}
		});
	};
	obj.__codeWord__ = codeWord;
	obj.__initialize__ = [workerSetup, addEvents, makeWorkerConsole];
	if (!('initialize' in obj)) {
		if ('init' in obj) {
			obj.__initialize__.push(obj.init);
		}
	}
	else {
		obj.__initialize__.push(obj.initialize);
	}

	if (!('events' in obj)) {
		obj.events = {};
	}
	if ('listners' in obj && typeof obj.listners !== 'function') {
		for (let key in obj.listners) {
			self.on(key, obj.listners[key]);
		}
	}
	let fObj = 'var _db = {\n\t';
	const keyFunc = function(key) {
		const out = function(data, transfer) {
			const i = promises.length;
			promises[i] = catiline.deferred();
			if (catiline._noTransferable) {
				worker.postMessage([
					[codeWord, i], key, data]);
			}
			else {
				worker.postMessage([
					[codeWord, i], key, data], transfer);
			}
			return promises[i].promise;
		};
		return out;
	};
	let i = false;
	for (let key in obj) {
		if(['listners','initialize','init'].indexOf(key)>-1){
			continue;
		}
		if (i) {
			fObj += ',\n\t';
		}
		else {
			i = true;
		}
		if (typeof obj[key] === 'function') {
			fObj = fObj + key + ':' + obj[key].toString();
			self[key] = keyFunc(key);
		}
		else {
			const outThing = catiline.stringify(obj[key]);
			if (typeof outThing !== 'undefined') {
				fObj = fObj + key + ':' + outThing;
			}
		}
	}
	fObj = fObj + '};';
	const worker = catiline.makeWorker(['\'use strict\';', '',
	fObj, '_db.__initialize__.forEach(function(f){', '	f.call(_db,_db);', '});', 'for(var key in _db.events){', '	_db.on(key,_db.events[key]);', '}'], codeWord);
	worker.onmessage = function(e) {
		self.trigger('message', e.data[1]);
		if (e.data[0][0] === codeWord) {
			promises[e.data[0][1]].resolve(e.data[1]);
			promises[e.data[0][1]] = 0;
		}
		else {
			self.trigger(e.data[0][0], e.data[1]);
		}
	};
	self.on('error', rejectPromises);
	worker.onerror = function(e) {
		self.trigger('error', e);
	};
	self.on('console', makeConsole);
	self._close = function() {
		worker.terminate();
		rejectPromises('closed');
		return catiline.resolve();
	};
	if (!('close' in self)) {
		self.close = self._close;
	}
}
catiline.Worker = Catiline;

catiline.worker = function(obj){
    return new Catiline(obj);
};