/*! communist 2013-05-19*/
/*!©2013 Calvin Metcalf @license MIT https://github.com/calvinmetcalf/communist */
if (typeof document === "undefined") {
	self._noTransferable=true;
	self.onmessage=function(e){
		eval(e.data);	
	}
} else {
(function(){
	"use strict";
/*! Promiscuous ©2013 Ruben Verborgh @license MIT https://github.com/RubenVerborgh/promiscuous*/
(function (exports) {
  var func = "function",
      noop = function () {};

  function createDeferred() {
    var handler,
        changeState,
        promise = {
          then: function (onFulfilled, onRejected) {
            return handler(onFulfilled, onRejected);
          }
        };

    (function () {
      var pending = [];
      handler = function (onFulfilled, onRejected) {
        var d = createDeferred();
        pending.push({ d: d, resolve: onFulfilled, reject: onRejected });
        return d.promise;
      };
      changeState = function (action, value, success) {
        for (var i = 0, l = pending.length; i < l; i++) {
          var p = pending[i], deferred = p.d, callback = p[action];
          if (typeof callback !== func)
            deferred[action](value);
          else
            execute(callback, value, deferred);
        }
        handler = createHandler(promise, value, success);
        changeState = noop;
      };
    })();

    return {
      resolve: function (value)  { changeState('resolve', value, true); },
      reject : function (reason) { changeState('reject', reason, false); },
      promise: promise
    };
  }

  function createHandler(promise, value, success) {
    return function (onFulfilled, onRejected) {
      var callback = success ? onFulfilled : onRejected, result;
      if (typeof callback !== func)
        return promise;
      setTimeout(execute.bind(promise, callback, value, result = createDeferred()));
      return result.promise;
    };
  }

  function execute(callback, value, deferred) {
    try {
      var result = callback(value);
      if (result && typeof result.then === func)
        result.then(deferred.resolve, deferred.reject);
      else
        deferred.resolve(result);
    }
    catch (error) {
      deferred.reject(error);
    }
  }

  exports.resolve= function (value) {
      var promise = {};
      promise.then = createHandler(promise, value, true);
      return promise;
    };
    exports.reject= function (reason) {
      var promise = {};
      promise.then = createHandler(promise, reason, false);
      return promise;
    }
    exports.deferred=createDeferred;
})(c);
c.all=function(array){
	var promise = c.deferred();
	var len = array.length;
	var i = 0;
	var resolved=0;
	var out = new Array(len);
	var onSuccess=function(n){
		return function(v){
			out[n]=v;
			resolved++;
			if(resolved===len){
				promise.resolve(out);
			}
		}
	}
	while(i<len){
		array[i].then(onSuccess(i),function(a){promise.reject(a)});
		i++;
	}
	return promise.promise;
}

//this is mainly so the name shows up when you look at the object in the console
var Communist = function(){};
//regex out the importScript call and move it up to the top out of the function.
function moveImports(string){
	var script;
	var match = string.match(/(importScripts\(.*\);)/);
	if(match){
		script = match[0].replace(/importScripts\((.*\.js\')\);?/,function(a,b){if(b){return "importScripts("+b.split(",").map(function(cc){return "'"+c.makeUrl(cc.slice(1,-1))+"'"})+");\n";}else{return "";}})+string.replace(/(importScripts\(.*\.js\'\);?)/,"\n");
	}else{
		script = string;
	}
	return script;
}

function getPath(){
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
//accepts an array of strings, joins them, and turns them into a worker.
function makeWorker(strings){
	var worker;
	var script =moveImports(strings.join(""));
	c.URL = c.URL||window.URL || window.webkitURL;
	try{
		worker= new Worker(c.URL.createObjectURL(new Blob([script],{type: "text/javascript"})));	
	}catch(e){
		c._noTransferable=true;
		worker = new Worker(getPath());
		worker.postMessage(script);
	}finally{
		return worker;
	}
}
//special case of worker only being called once, instead of sending the data
//we can bake the data into the worker when we make it.

function single(fun,data){
	var promise = c.deferred();
	var worker = makeWorker(['var _self={};\n_self.fun = ',fun,';\n\
	_self.cb=function(data,transfer){\n\
			!self._noTransferable?self.postMessage(data,transfer):self.postMessage(data);\n\
			self.close();\n\
		};\n\
		_self.result = _self.fun(',JSON.stringify(data),',_self.cb);\n\
		if(typeof _self.result !== "undefined"){\n\
			_self.cb(_self.result);\n\
		}']);
	worker.onmessage=function(e){
		promise.resolve(e.data);
	};
	worker.onerror=function(e){
		e.preventDefault();
		promise.reject(e.message);
	};
	return promise.promise;
};
function mapWorker(fun,callback,onerr){
	var w = new Communist();
	var worker = makeWorker(['\n\
	var _db={};\n\
	_db.__close__=function(){\n\
		self.close();\n\
	};\n\
	var _self={};\n\
	_db.__fun__ = ',fun,';\n\
	_self.cb=function(data,transfer){\n\
		!self._noTransferable?self.postMessage(data,transfer):self.postMessage(data);\n\
	};\n\
	self.onmessage=function(e){\n\
		_self.result = _db.__fun__(e.data,_self.cb);\n\
			if(typeof _self.result !== "undefined"){\n\
				_self.cb(_self.result);\n\
		}\n\
	}']);
	worker.onmessage = function(e){
		callback(e.data);
	};
	if(onerr){
		worker.onerror=onerr;
	}else{
		worker.onerror=function(){callback();};
	}
	w.data=function(data,transfer){
		!c._noTransferable?worker.postMessage(data,transfer):worker.postMessage(data);	
		return w;
	};
	w.close=function(){
		return worker.terminate();
	};
	return w;
};
function multiUse(fun){
	return object({data:fun});
};
function object(obj){
	var w = new Communist();
	var i = 0;
	var promises = [];
	var rejectPromises = function(msg){
		if(typeof msg!=="string" && msg.preventDefault){
			msg.preventDefault();
			msg=msg.message;
		}
		promises.forEach(function(p){
			if(p){
				p.reject(msg);
			}	
		});
	};
	if(!("initialize" in obj)){
		obj.initialize=function(){};
	}
	var fObj="{";
	var keyFunc=function(key){
		var out = function(data, transfer){
			var i = promises.length;
			promises[i] = c.deferred();
			!c._noTransferable?worker.postMessage([i,key,data],transfer):worker.postMessage([i,key,data]);
			return promises[i].promise;
		};
		return out;	
		};
	for(var key in obj){
		if(i!==0){
			fObj=fObj+",";
		}else{
			i++;
		}
		fObj=fObj+key+":"+obj[key].toString();
		w[key]=keyFunc(key);
	}
	fObj=fObj+"}";
	
	var worker = makeWorker(['\n\
	var _db='+fObj+';\n\
	self.onmessage=function(e){\n\
	var cb=function(data,transfer){\n\
		!self._noTransferable?self.postMessage([e.data[0],data],transfer):self.postMessage([e.data[0],data]);\n\
	};\n\
		var result = _db[e.data[1]](e.data[2],cb);\n\
			if(typeof result !== "undefined"){\n\
				cb(result);\n\
			}\n\
	}']);
	worker.onmessage= function(e){
			promises[e.data[0]].resolve(e.data[1]);
			promises[e.data[0]]=0;
	};
	worker.onerror=rejectPromises;
	w._close = function(){
		worker.terminate();
		rejectPromises("closed");
		return c.resolve("done");
	};
	if(!('close' in w)){
		w.close=w._close;
	}

	return w;
}

function queue(obj,n){
	var w = new Communist();
	w.batch={};
	w.batchTransfer={};
	var workers = new Array(n);
	var numIdle=0;
	var idle=[];
	var queue=[];
	var queueLen=0;
	while(numIdle<n){
		workers[numIdle]=object(obj);
		idle.push(numIdle);
		numIdle++;
	}
	obj._close=function(){};
	for(var key in obj){
		w[key]=(function(k){
			return function(data,transfer){
				return doStuff(k,data,transfer);
			}
		})(key);
		w.batch[key]=(function(k){
			return function(array){
				return c.all(array.map(function(data){
					return doStuff(k,data);
				}));
			}
		})(key);
		w.batchTransfer[key]=(function(k){
			return function(array){
				return c.all(array.map(function(data){
					return doStuff(k,data[0],data[1]);
				}));
			}
		})(key);
	};
	function done(num){
		var data;
		if(queueLen){
			data = queue.pop();
			queueLen--;
			workers[num][data[0]](data[1],data[2]).then(function(d){
				done(num);
				data[3].resolve(d);
			},function(d){
				done(num);
				data[3].reject(d);
			});
		}else{
			numIdle++;
			idle.push(num);
		}
	}
	function doStuff(key,data,transfer){
		var promise = c.deferred(),num;
		if(!queueLen && numIdle){
			num = idle.pop();
			numIdle--;
			workers[num][key](data,transfer).then(function(d){
				done(num);
				promise.resolve(d);
			},function(d){
				done(num);
				promise.reject(d);
			});
		}else if(queueLen||!numIdle){
			queueLen=queue.push([key,data,transfer,promise]);
		}
		return promise.promise;
	}
	if(!('close' in w)){
		w.close=w._close;
	}
	return w;
}

function rWorker(fun,callback){
	var w = new Communist();
	var func = 'function(dat,cb){ var fun = '+fun+';\n\
		switch(dat[0]){\n\
			case "data":\n\
				if(!this._r){\n\
					this._r = dat[1];\n\
				}else{\n\
					this._r = fun(this._r,dat[1]);\n\
				}\n\
				break;\n\
			case "get":\n\
				return cb(this._r);\n\
			case "close":\n\
				cb(this._r);\n\
				this.__close__();\n\
				break;\n\
		}\n\
	};';
	var cb =function(data){
		callback(data);	
	};
	var worker = mapWorker(func,cb);
	w.data=function(data,transfer){
		!c._noTransferable?worker.data(["data",data],transfer):worker.data(["data",data]);
		return w;
	};
	w.fetch=function(){
		worker.data(["get"]);
		return w;
	};
	w.close=function(silent){
		if(silent){
			callback=function(){};
		}
		worker.data(["close"]);
		return;
	};
	return w;
};
function incrementalMapReduce(threads){
	var w = new Communist();
	var len = 0;
	var promise;
	var workers = [];
	var data=[];
	var idle = threads;
	var reducer;
	var waiting=false;
	var closing=false;
	var status = {
		map:false,
		reduce:false,
		data:false
	};
	var checkStatus = function(){
		if(status.map && status.reduce && status.data){
			return go();
		}else{
			return w;
		}
	};
	w.map=function(fun, t){
		if(status.map){
			return w;
		}
		var i = 0;
		while(i<threads){
			(function(){
				var dd;
				var mw = mapWorker(fun, function(d){
					if(typeof d !== undefined){
						reducer.data(d);
					}
					if(len>0){
						len--;
						dd = data.pop();
						if(t){
							mw.data(dd,[dd]);
						}else{
						mw.data(dd);
						}
					}else{ 
						idle++;
						if(idle===threads){
							status.data=false;
						if(closing){
							closeUp();
							}else if(waiting){
								waiting = false;
								reducer.fetch();
							}
						}
					}
				});
			workers.push(mw);
			})();
			i++;
		}
		status.map=true;
		return checkStatus();
	};
	w.reduce=function(fun){
		if(status.reduce){
			return w;
		}
		reducer = rWorker(fun,function(d){
			if(promise){
				promise.resolve(d);
				promise = false;
			}
		});
		status.reduce=true;
		return checkStatus();
	};
	w.data = function(d){
		if(closing){
			return;
		}
		len = len + d.length;
		data = data.concat(d);
		status.data=true;
		return checkStatus();
	};
	function go(){
		var i = 0;
		var wlen = workers.length;
		while(i<wlen && len>0 && idle>0){
			len--;
			workers[i].data(data.pop());
			i++;
			idle--;
		}
		return w;
	}
	w.fetch=function(now){
		if(!promise){
			promise = c.deferred();
		}
		if(idle<threads && !now){
			waiting=true;
		}else{
			reducer.fetch();
		}
		return promise.promise;
	};
	w.close=function(){
		if(!promise){
			promise = c.deferred();
		}
		if(idle<threads){
			closing=true;
		}else{
			closeUp();
		}
		return promise.promise;
	};
	function closeUp(){
		reducer.close();
		workers.forEach(function(v){
			v.close();	
		});
	}
	return w;
};
function nonIncrementalMapReduce(threads){
	var w = new Communist();
	var worker = incrementalMapReduce(threads);
	var steps = {data:false,map:false,reduce:false};
	w.map = function(f,t){
		steps.map=true;
		worker.map(f,t);
		return check();
	};
	w.reduce = function(f){
		steps.reduce=true;
		worker.reduce(f);
		return check();
	};
	w.data = function(d){
		steps.data=true;
		worker.data(d);
		return check();
	};
	
	function check(){
		if(steps.data&&steps.map&&steps.reduce){
			return worker.close();
		}else{
			return w;
		}
	}
	return w;
};
function c(a,b,c){
	if(typeof a !== "number" && typeof b === "function"){
		return mapWorker(a,b,c);
	}else if(typeof a === "object" && !Array.isArray(a)){
		if(typeof b === "number"){
			return queue(a,b);
		}else{
			return object(a);
		}
	}else if(typeof a !== "number"){
		return b ? single(a,b):multiUse(a);
	}else if(typeof a === "number"){
		return !b ? incrementalMapReduce(a):nonIncrementalMapReduce(a);
	}
};
c.reducer = rWorker;
c.worker = makeWorker;
c.makeUrl = function (fileName) {
	var link = document.createElement("link");
	link.href = fileName;
	return link.href;
};
c.ajax = function(url,after,notjson){
	var txt=!notjson?'JSON.parse(request.responseText)':"request.responseText";
	var resp = after?"("+after.toString()+")("+txt+",_cb)":txt;
	var func = 'function (url, _cb) {\n\
		var request = new XMLHttpRequest();\n\
		request.open("GET", url);\n\
			request.onreadystatechange = function() {\n\
				var _resp;\n\
				if (request.readyState === 4 && request.status === 200) {\n'+
					'_resp = '+resp+';\n\
					if(typeof _resp!=="undefined"){_cb(_resp);}\n\
					}\n\
			};\n\
			request.onerror=function(e){throw(e);}\n\
		request.send();\n\
	}';
	return c(func,c.makeUrl(url));
};
window["communist"]=c;
})();}