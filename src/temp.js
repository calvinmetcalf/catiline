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
		var self = this;
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
			!communist._noTransferable ? worker.postMessage([
				[eventName], data], transfer) : worker.postMessage([
				[eventName], data]);
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
			self[key] = keyFunc(key);
		}
		fObj = fObj + "}";
		var worker = communist.makeWorker(['"use strict";var _db = ',fObj,';var listeners = {};_db.on = function (eventName, func, scope) {	if(eventName.indexOf(" ")>0){		return eventName.split(" ").map(function(v){			return _db.on(v,func,scope);		},_db);	}	scope = scope || _db;	if (!(eventName in listeners)) {		listeners[eventName] = [];	}	listeners[eventName].push(function (a) {		func.call(scope, a, _db);	});};function _fire(eventName,data){	if(eventName.indexOf(" ")>0){		eventName.split(" ").forEach(function(v){			_fire(v,data);		});		return;	}	if (!(eventName in listeners)) {		return;	}	listeners[eventName].forEach(function (v) {		v(data);	});}_db.fire = function (eventName, data, transfer) {	!self._noTransferable ? self.postMessage([		[eventName], data], transfer) : self.postMessage([		[eventName], data]);};_db.off=function(eventName,func){	if(eventName.indexOf(" ")>0){		return eventName.split(" ").map(function(v){			return _db.off(v,func);		});	}	if(!(eventName in listeners)){		return;	}else if(!func){		delete listeners[eventName];	}else{		if(listeners[eventName].indexOf(func)>-1){			if(listeners[eventName].length>1){				delete listeners[eventName];			}else{				listeners[eventName].splice(listeners[eventName].indexOf(func),1);			}		}	}};var console={};function makeConsole(method){	return function(){		var len = arguments.length;		var out =[];		var i = 0;		while (i<len){			out.push(arguments[i]);			i++;		}		_db.fire("console",[method,out]);	};}["log", "debug", "error", "info", "warn", "time", "timeEnd"].forEach(function(v){	console[v]=makeConsole(v);});self.onmessage=function(e){	_fire("messege",e.data[1]);	if(e.data[0][0]==="com.communistjs"){		return regMsg(e);	}else{		_fire(e.data[0][0],e.data[1]);	}};var regMsg = function(e){	var cb=function(data,transfer){		!self._noTransferable?self.postMessage([e.data[0],data],transfer):self.postMessage([e.data[0],data]);	};	var result = _db[e.data[1]](e.data[2],cb,_db);	if(typeof result !== "undefined"){		cb(result);	}};_db.initialize(_db);']);
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
		self.on('console', function (msg) {
			console[msg[0]].apply(console, msg[1]);
		});
		self._close = function () {
			worker.terminate();
			rejectPromises("closed");
			return communist.resolve();
		};
		if (!('close' in self)) {
			self.close = self._close;
		}
	};
communist.worker = function (obj){
	return new communist.Worker(obj);
};
