/*! communist 2.2.0 2013-08-01*/
/*!©2013 Calvin Metcalf @license MIT https://github.com/calvinmetcalf/communist */
if (typeof document === "undefined") {
	self._noTransferable=true;
	self.onmessage=function(e){
		/*jslint evil: true */
		eval(e.data);
	};
} else {
(function(global){
	"use strict";
/*!From setImmediate Copyright (c) 2012 Barnesandnoble.com,llc, Donavon West, and Domenic Denicola @license MIT https://github.com/NobleJS/setImmediate */
(function(attachTo,global) {
	var tasks = (function () {
		function Task(handler, args) {
			this.handler = handler;
			this.args = args;
		}
		Task.prototype.run = function () {
			// See steps in section 5 of the spec.
			if (typeof this.handler === "function") {
				// Choice of `thisArg` is not in the setImmediate spec; `undefined` is in the setTimeout spec though:
				// http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html
				this.handler.apply(undefined, this.args);
			} else {
				var scriptSource = "" + this.handler;
				/*jshint evil: true */
				eval(scriptSource);
			}
		};

		var nextHandle = 1; // Spec says greater than zero
		var tasksByHandle = {};
		var currentlyRunningATask = false;

		return {
			addFromSetImmediateArguments: function (args) {
				var handler = args[0];
				var argsToHandle = Array.prototype.slice.call(args, 1);
				var task = new Task(handler, argsToHandle);

				var thisHandle = nextHandle++;
				tasksByHandle[thisHandle] = task;
				return thisHandle;
			},
			runIfPresent: function (handle) {
				// From the spec: "Wait until any invocations of this algorithm started before this one have completed."
				// So if we're currently running a task, we'll need to delay this invocation.
				if (!currentlyRunningATask) {
					var task = tasksByHandle[handle];
					if (task) {
						currentlyRunningATask = true;
						try {
							task.run();
						} finally {
							delete tasksByHandle[handle];
							currentlyRunningATask = false;
						}
					}
				} else {
					// Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
					// "too much recursion" error.
					global.setTimeout(function () {
						tasks.runIfPresent(handle);
					}, 0);
				}
			},
			remove: function (handle) {
				delete tasksByHandle[handle];
			}
		};
	}());
		// Installs an event handler on `global` for the `message` event: see
		// * https://developer.mozilla.org/en/DOM/window.postMessage
		// * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

		var MESSAGE_PREFIX = "com.communistjs.setImmediate" + Math.random();

		function isStringAndStartsWith(string, putativeStart) {
			return typeof string === "string" && string.substring(0, putativeStart.length) === putativeStart;
		}

		function onGlobalMessage(event) {
			// This will catch all incoming messages (even from other windows!), so we need to try reasonably hard to
			// avoid letting anyone else trick us into firing off. We test the origin is still this window, and that a
			// (randomly generated) unpredictable identifying prefix is present.
			if (event.source === global && isStringAndStartsWith(event.data, MESSAGE_PREFIX)) {
				var handle = event.data.substring(MESSAGE_PREFIX.length);
				tasks.runIfPresent(handle);
			}
		}
		if (global.addEventListener) {
			global.addEventListener("message", onGlobalMessage, false);
		} else {
			global.attachEvent("onmessage", onGlobalMessage);
		}

		attachTo.setImmediate = function () {
			var handle = tasks.addFromSetImmediateArguments(arguments);

			// Make `global` post a message to itself with the handle and identifying prefix, thus asynchronously
			// invoking our onGlobalMessage listener above.
			global.postMessage(MESSAGE_PREFIX + handle, "*");

			return handle;
		};
	})(communist,global);
/*! Promiscuous ©2013 Ruben Verborgh @license MIT https://github.com/RubenVerborgh/promiscuous*/
(function (exports,tick) {
	var func = "function";
	// Creates a deferred: an object with a promise and corresponding resolve/reject methods
	function Deferred() {
		// The `handler` variable points to the function that will
		// 1) handle a .then(onFulfilled, onRejected) call
		// 2) handle a .resolve or .reject call (if not fulfilled)
		// Before 2), `handler` holds a queue of callbacks.
		// After 2), `handler` is a simple .then handler.
		// We use only one function to save memory and complexity.
		var handler = function (onFulfilled, onRejected, value) {
			// Case 1) handle a .then(onFulfilled, onRejected) call
			var createdDeffered;
			if (onFulfilled !== handler) {
				createdDeffered = createDeferred();
				handler.queue.push({ deferred: createdDeffered, resolve: onFulfilled, reject: onRejected });
				return createdDeffered.promise;
			}

			// Case 2) handle a .resolve or .reject call
			// (`onFulfilled` acts as a sentinel)
			// The actual function signature is
			// .re[ject|solve](sentinel, success, value)
			var action = onRejected ? 'resolve' : 'reject',queue,deferred,callback;
			for (var i = 0, l = handler.queue.length; i < l; i++) {
				queue = handler.queue[i];
				deferred = queue.deferred;
				callback = queue[action];
				if (typeof callback !== func) {
					deferred[action](value);
				} else {
					execute(callback, value, deferred);
				}
			}
			// Replace this handler with a simple resolved or rejected handler
			handler = createHandler(promise, value, onRejected);
		};
		function Promise(){
			this.then=function (onFulfilled, onRejected) {
				return handler(onFulfilled, onRejected);
			};
		}
		var promise = new Promise();
		this.promise = promise;
		// The queue of deferreds
		handler.queue = [];

		this.resolve = function (value)	{
			handler.queue && handler(handler, true, value);
		};
			
		this.reject = function (reason) {
			handler.queue && handler(handler, false, reason);
		};
	}
	
	function createDeferred(){
		return new Deferred();
	}
	
	// Creates a fulfilled or rejected .then function
	function createHandler(promise, value, success) {
		return function (onFulfilled, onRejected) {
			var callback = success ? onFulfilled : onRejected, result;
			if (typeof callback !== func) {
				return promise;
			}
			execute(callback, value, result = createDeferred());
			return result.promise;
		};
	}

	// Executes the callback with the specified value,
	// resolving or rejecting the deferred
	function execute(callback, value, deferred) {
		tick(function () {
			var result;
			try {
				result = callback(value);
				if (result && typeof result.then === func) {
					result.then(deferred.resolve, deferred.reject);
				} else {
					deferred.resolve(result);
				}
			}
			catch (error) {
				deferred.reject(error);
			}
		});
	}
 
	// Returns a resolved promise
	exports.resolve= function (value) {
		var promise = {};
		promise.then = createHandler(promise, value, true);
		return promise;
	};
	// Returns a rejected promise
	exports.reject= function (reason) {
		var promise = {};
		promise.then = createHandler(promise, reason, false);
		return promise;
	};
	// Returns a deferred
	exports.deferred= createDeferred;
	exports.all=function(array){
		var promise = exports.deferred();
		var len = array.length;
		var resolved=0;
		var out = [];
		var onSuccess=function(n){
			return function(v){
				out[n]=v;
				resolved++;
				if(resolved===len){
					promise.resolve(out);
				}
			};
		};
		array.forEach(function(v,i){
			v.then(onSuccess(i),function(a){
				promise.reject(a);
			});
		});
		return promise.promise;
	};
})(communist,communist.setImmediate);

//regex out the importScript call and move it up to the top out of the function.
function regexImports(string){
	var rest=string,
	match = true,
	matches = {},
	loopFunc = function(a,b){
		if(b){
			"importScripts("+b.split(",").forEach(function(cc){
				matches[communist.makeUrl(cc.match(/\s*[\'\"](\S*)[\'\"]\s*/)[1])]=true; // trim whitespace, add to matches
			})+");\n";
		}
	};
	while(match){
		match = rest.match(/(importScripts\(.*?\);?)/);
		rest = rest.replace(/(importScripts\(\s*(?:[\'\"].*?[\'\"])?\s*\);?)/,"\n");
		if(match){
			match[0].replace(/importScripts\(\s*([\'\"].*?[\'\"])?\s*\);?/g,loopFunc);
		}
	}
	matches = Object.keys(matches);
	return [matches,rest];
}

function moveImports(string){
	var str = regexImports(string);
	var matches = str[0];
	var rest = str[1];
	if(matches.length>0){
		return 'importScripts("'+matches.join('","')+'");\n'+rest;
	}else{
		return rest;
	}
}
function moveIimports(string){
	var str = regexImports(string);
	var matches = str[0];
	var rest = str[1];
	if(matches.length>0){
		return 'importScripts("'+matches.join('","')+'");eval(__scripts__);\n'+rest;
	}else{
		return rest;
	}
}
function getPath(){
	if(typeof SHIM_WORKER_PATH !== "undefined"){
		return SHIM_WORKER_PATH;
	}
	var scripts = document.getElementsByTagName("script");
		var len = scripts.length;
		var i = 0;
		while(i<len){
			if(/communist(\.min)?\.js/.test(scripts[i].src)){
				return scripts[i].src;
			}
			i++;
		}
}
function appendScript(iDoc,text){
	var iScript = iDoc.createElement('script');
			if (iScript.text !== void 0) {
				iScript.text = text;
			} else {
				iScript.innerHTML = text;
			}
		if(iDoc.readyState==="complete"){
		iDoc.documentElement.appendChild(iScript);
		}else{
			iDoc.onreadystatechange=function(){
				console.log(iDoc.readyState);
				if(iDoc.readyState==="complete"){
		iDoc.documentElement.appendChild(iScript);
		}
			};
		}
}
function actualMakeI(script,codeword){
	var iFrame = document.createElement('iframe');
		iFrame.style.display = 'none';
		document.body.appendChild(iFrame);
		var iWin = iFrame.contentWindow;
		var iDoc = iWin.document;
	var text='try{ '+
	'var __scripts__="";function importScripts(scripts){	if(Array.isArray(scripts)&&scripts.length>0){		scripts.forEach(function(url){			var ajax = new XMLHttpRequest();			ajax.open("GET",url,false);ajax.send();__scripts__+=ajax.responseText;__scripts__+="\\n;";});}};'+script+
	'}catch(e){window.top.postMessage(["'+codeword+'","error"],"*")}';
	if(true || iDoc.readyState==="complete"){
		appendScript(iDoc,text);
	}else{
		iWin.__loaded__=function(){
			appendScript(iDoc,text);
		};
		iDoc.open();
		iDoc.write('<script>__loaded__()</script>');
		iDoc.close();
	}

	return iFrame;
}
function makeIframe(script,codeword){
	var promise = communist.deferred();
	if(document.readyState==="complete"){
		promise.resolve(actualMakeI(script,codeword));
	}else{
		window.addEventListener('load',function(){
			promise.resolve(actualMakeI(script,codeword));
		},false);
	}
	return promise.promise;
}
communist.makeIWorker = function (strings,codeword){
	var script =moveIimports(strings.join(""));
	var worker = {onmessage:function(){}};
	var ipromise = makeIframe(script,codeword);
	window.addEventListener('message',function(e){
		if(Array.isArray(e.data)&&e.data[0]===codeword){
			e.data.shift();
			worker.onmessage(e);
		}
	});
	worker.postMessage=function(data){
		ipromise.then(function(iFrame){
			iFrame.contentWindow.postMessage(data,"*");
		});
	};
	worker.terminate=function(){
		ipromise.then(function(iFrame){
			document.body.removeChild(iFrame);
		});
	};
	return worker;
	
};
//accepts an array of strings, joins them, and turns them into a worker.
communist.makeWorker = function (strings){
	var worker;
	var script =moveImports(strings.join(""));
	communist.URL = communist.URL||window.URL || window.webkitURL;
	try{
		worker= new Worker(communist.URL.createObjectURL(new Blob([script],{type: "text/javascript"})));
	}catch(e){
		communist._noTransferable=true;
		worker = new Worker(getPath());
		worker.postMessage(script);
	}finally{
		return worker;
	}
};

communist.makeUrl = function (fileName) {
	var link = document.createElement("link");
	link.href = fileName;
	return link.href;
};
function FakeCommunist(inObj) {
	/*jslint evil: true */
	var self = this;
	var promises = [];
	var loaded = false;
	var wlisteners = {};
	var olisteners = {};
	var loading;
	var called = false;

	function ajax(url) {
		var promise = communist.deferred();
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.onload = function () {
			promise.resolve(xhr.responseText);
		};
		xhr.onerror = function () {
			promise.reject('failed to download');
		};
		xhr.send();
		return promise.promise;
	}
	var rejectPromises = function (msg) {
		if (typeof msg !== "string" && msg.preventDefault) {
			msg.preventDefault();
			msg = msg.message;
		}
		promises.forEach(function (p) {
			if (p) {
				p.reject(msg);
			}
		});
	};
	var obj;
	if (!("initialize" in inObj)) {
		if ('init' in inObj) {
			inObj.initialize = inObj.init;
		}
		else {
			inObj.initialize = function () {};
		}
	}
	var keyFunc = function (key) {
		var actualFunc = function (data) {
			var result, i, callback;
			i = promises.length;
			if (!called) {
				called = true;
			}
			promises[i] = communist.deferred();
			callback = function (data) {
				promises[i].resolve(data);
			};
			try {
				result = obj[key].call(obj, data, callback, obj);
				if (typeof result !== "undefined") {
					callback(result);
				}
			}
			catch (e) {
				obj.fire('error', e);
				promises[i].reject(e);
			}
			return promises[i].promise;
		};
		return function (data) {
			if (loaded) {
				return actualFunc(data);
			}
			else {
				return loading.then(function () {
					return actualFunc(data);
				});
			}
		};
	};
	var i = 0;
	var fObj = "{";
	for (var key in inObj) {
		if (i !== 0) {
			fObj = fObj + ",";
		}
		else {
			i++;
		}
		fObj = fObj + key + ":" + inObj[key].toString();
		self[key] = keyFunc(key);
	}
	fObj = fObj + "}";
	var re = /(\S+?:function\s*?)([a-zA-Z0-9$_]+?)(\s*?\()/g;
	var regexed = regexImports(fObj);
	var forImport = regexed[0];
	if (forImport.length === 0) {
		loaded = true;
		(function () {
			eval('obj = ' + regexed[1].replace(re, '$1$3'));
		})();
		addEvents(self, obj);
	}
	else {
		loading = communist.all(forImport.map(function (v) {
			return ajax(v);
		})).then(function (array) {
			eval(array.join("\n") + ";\nobj = " + regexed[1].replace(re, '$1$3'));
			addEvents(self, obj);
			return true;
		});
	}

	function addEvents(self, obj) {
		self.on = function (eventName, func, scope) {
			scope = scope || self;
			if (eventName.indexOf(' ') > 0) {
				eventName.split(' ').map(function (v) {
					return self.on(v, func, scope);
				}, this);
				return self;
			}
			if (!(eventName in wlisteners)) {
				wlisteners[eventName] = [];
			}
			wlisteners[eventName].push(function (a) {
				func.call(scope, a);
			});
		};
		self.fire = function (eventName, data) {
			if (eventName.indexOf(' ') > 0) {
				eventName.split(' ').forEach(function (v) {
					self.fire(v, data);
				});
				return self;
			}
			communist.setImmediate(function () {
				if (eventName in olisteners && Array.isArray(olisteners[eventName])) {
					olisteners[eventName].forEach(function (v) {
						v(data);
					});
				}
			});
			return self;
		};
		self.off = function (eventName, func) {
			if (eventName.indexOf(' ') > 0) {
				eventName.split(' ').map(function (v) {
					return self.off(v, func);
				});
				return self;
			}
			if (!(eventName in wlisteners)) {
				return self;
			}
			else if (!func) {
				delete wlisteners[eventName];
			}
			else {
				if (wlisteners[eventName].indexOf(func) > -1) {
					if (wlisteners[eventName].length > 1) {
						delete wlisteners[eventName];
					}
					else {
						wlisteners[eventName].splice(wlisteners[eventName].indexOf(func), 1);
					}
				}
			}
			return self;
		};
		obj.on = function (eventName, func, scope) {
			scope = scope || obj;
			if (eventName.indexOf(' ') > 0) {
				eventName.split(' ').map(function (v) {
					return obj.on(v, func, scope);
				}, this);
				return obj;
			}
			if (!(eventName in olisteners)) {
				olisteners[eventName] = [];
			}
			olisteners[eventName].push(function (a) {
				try {
					func.call(scope, a, obj);
				}
				catch (e) {
					obj.fire('error', {
						preventDefault: function () {},
						messege: e
					});
				}
			});
			return obj;
		};
		obj.fire = function (eventName, data) {
			if (eventName.indexOf(' ') > 0) {
				eventName.split(' ').forEach(function (v) {
					obj.fire(v, data);
				});
				return obj;
			}
			if (!(eventName in wlisteners)) {
				return obj;
			}
			wlisteners[eventName].forEach(function (v) {
				v(data);
			});
			return obj;
		};
		obj.off = function (eventName, func) {
			if (eventName.indexOf(' ') > 0) {
				eventName.split(' ').map(function (v) {
					return obj.off(v, func);
				});
				return obj;
			}
			if (!(eventName in olisteners)) {
				return obj;
			}
			else if (!func) {
				delete olisteners[eventName];
			}
			else {
				if (olisteners[eventName].indexOf(func) > -1) {
					if (olisteners[eventName].length > 1) {
						delete olisteners[eventName];
					}
					else {
						olisteners[eventName].splice(olisteners[eventName].indexOf(func), 1);
					}
				}
			}
			return obj;
		};
	}
	self._close = function () {
		olisteners = {};
		wlisteners = {};
		promises.forEach(function (a) {
			a.reject("closed");
		});
		return communist.resolve();
	};
	if (!('close' in self)) {
		self.close = self._close;
	}
	if (!called) {
		self.initialize(obj);
	}
}

function fakeObject(inObj) {
	return new FakeCommunist(inObj);
}

communist.IWorker = function iCommunist(obj) {
		var listeners = {};
		var self = this;
		var __codeWord__='com.communistjs.iframe'+Math.random();
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
		obj.__codeWord__='"'+__codeWord__+'"';
		var fObj = "{";
		var keyFunc = function (key) {
			var out = function (data, transfer) {
				var i = promises.length;
				promises[i] = communist.deferred();
				worker.postMessage([
					[__codeWord__, i], key, data], "*");
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
		var worker = communist.makeIWorker(['var _db = ',fObj,';var __self__={onmessage:function(){}};window.onmessage=function(e){	__self__.onmessage(e);};__self__.postMessage=function(data){	data.unshift(_db.__codeWord__);	window.top.postMessage(data,"*");};var listeners = {};_db.on = function (eventName, func, scope) {	if(eventName.indexOf(" ")>0){		return eventName.split(" ").map(function(v){			return _db.on(v,func,scope);		},_db);	}	scope = scope || _db;	if (!(eventName in listeners)) {		listeners[eventName] = [];	}	listeners[eventName].push(function (a) {		func.call(scope, a, _db);	});};function _fire(eventName,data){	if(eventName.indexOf(" ")>0){		eventName.split(" ").forEach(function(v){			_fire(v,data);		});		return;	}	if (!(eventName in listeners)) {		return;	}	listeners[eventName].forEach(function (v) {		v(data);	});}_db.fire = function (eventName, data, transfer) {	__self__.postMessage([		[eventName], data]);};_db.off=function(eventName,func){	if(eventName.indexOf(" ")>0){		return eventName.split(" ").map(function(v){			return _db.off(v,func);		});	}	if(!(eventName in listeners)){		return;	}else if(!func){		delete listeners[eventName];	}else{		if(listeners[eventName].indexOf(func)>-1){			if(listeners[eventName].length>1){				delete listeners[eventName];			}else{				listeners[eventName].splice(listeners[eventName].indexOf(func),1);			}		}	}};/*var console={};function makeConsole(method){	return function(){		var len = arguments.length;		var out =[];		var i = 0;		while (i<len){			out.push(arguments[i]);			i++;		}		_db.fire("console",[method,out]);	};}["log", "debug", "error", "info", "warn", "time", "timeEnd"].forEach(function(v){	console[v]=makeConsole(v);});*/__self__.onmessage=function(e){	_fire("messege",e.data[1]);	if(e.data[0][0]===_db.__codeWord__){		return regMsg(e);	}else{		_fire(e.data[0][0],e.data[1]);	}};var regMsg = function(e){	var cb=function(data,transfer){		__self__.postMessage([e.data[0],data]);	};	var result;	try{		result = _db[e.data[1]](e.data[2],cb,_db);	}catch(e){		_db.fire("error",JSON.stringify(e));	}	if(typeof result !== "undefined"){		cb(result);	}};_db.initialize(_db);'],__codeWord__);
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
		self.on('error', function (e) {
			rejectPromises(e);
		});
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
communist.iWorker = function (obj){
	return new communist.IWorker(obj);
};

communist.Worker = function Communist(obj) {
		if(typeof obj === 'function'){
			obj = {
				data:obj
			};
		}
		if(typeof Worker === 'undefined'||typeof fakeLegacy !== 'undefined'){
			return new communist.IWorker(obj);
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

communist.Queue = function CommunistQueue(obj, n, dumb) {
	var self = this;
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
	var workers = new Array(n);
	var numIdle = 0;
	var idle = [];
	var que = [];
	var queueLen = 0;
	while (numIdle < n) {
		workers[numIdle] = new communist.Worker(obj);
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
		var oQ = que;
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
			return communist.all(array.map(function (data) {
				return doStuff(k, data);
			}));
		};
	}

	function keyFuncBatchCB(k) {
		return function (array) {
			var self = this;
			return communist.all(array.map(function (data) {
				return doStuff(k, data).then(self.__cb__);
			}));
		};
	}

	function keyFuncBatchTransfer(k) {
		return function (array) {
			return communist.all(array.map(function (data) {
				return doStuff(k, data[0], data[1]);
			}));
		};
	}

	function keyFuncBatchTransferCB(k) {
		return function (array) {
			var self = this;
			return communist.all(array.map(function (data) {
				return doStuff(k, data[0], data[1]).then(self.__cb__);
			}));
		};
	}
	for (var key in obj) {
		self[key] = keyFunc(key);
		self.batch[key] = keyFuncBatch(key);
		self.__batchcb__[key] = keyFuncBatchCB(key);
		self.batchTransfer[key] = keyFuncBatchTransfer(key);
		self.__batchtcb__[key] = keyFuncBatchTransferCB(key);
	}

	function done(num) {
		var data;
		if (queueLen) {
			data = que.shift();
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
		if (dumb) {
			return workers[~~ (Math.random() * n)][key](data, transfer);
		}
		var promise = communist.deferred(),
			num;
		if (!queueLen && numIdle) {
			num = idle.pop();
			numIdle--;
			workers[num][key](data, transfer).then(function (d) {
				done(num);
				promise.resolve(d);
			}, function (d) {
				done(num);
				promise.reject(d);
			});
		}
		else if (queueLen || !numIdle) {
			queueLen = que.push([key, data, transfer, promise]);
		}
		return promise.promise;
	}
	self._close = function () {
		return communist.all(workers.map(function (w) {
			return w._close();
		}));
	};
	if (!('close' in self)) {
		self.close = self._close;
	}
};
communist.queue = function (obj, n, dumb) {
	return new communist.Queue(obj, n, dumb);
};

function communist(object,queueLength,unmanaged){
	if(arguments.length === 1 || !queueLength || queueLength <= 1){
		return new communist.Worker(object);
	}else{
		return new communist.Queue(object,queueLength,unmanaged);
	}
}

function initBrowser(communist){
	var origCW = global.cw;
	communist.noConflict=function(newName){
		global.cw = origCW;
		if(newName){
			global[newName]=communist;
		}
	};
	global.communist = communist;
	global.cw = communist;
	
}
if(typeof module === "undefined" || !('exports' in module)){
	initBrowser(communist);
} else {
	module.exports=communist;
}
communist.version = "2.2.0";
})(this);}