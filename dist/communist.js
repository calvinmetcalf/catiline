/*! communist 2013-03-18 */
(function(RSVP){
"use strict";
function makePromise(){
	return RSVP.defer();
}
//this is mainly so the name shows up when you look at the object in the console
var Communist = function(){};
//regex out the importScript call and move it up to the top out of the function.
var moveImports = function(string){
	var script;
	var match = string.match(/(importScripts\(.*\);)/);
	if(match){
		script = match[0].replace(/importScripts\((.*)\);?/,function(a,b){if(b){return "importScripts("+b.split(",").map(function(cc){return '"'+c.makeUrl(cc.slice(1,-1))+'"'})+");\n";}else{return "";}})+string.replace(/(importScripts\(.*\);?)/,"\n");
	}else{
		script = string;
	}
	return script;
};

//accepts an array of strings, joins them, and turns them into a worker.
var makeWorker = function(strings){
	var worker;
	var script =moveImports(strings.join(""));
	c.URL = c.URL||window.URL || window.webkitURL || self.URL;
	if(window.communist.IEpath){
		try{
			worker = new Worker(c.URL.createObjectURL(new Blob([script],{type: "text/javascript"})));	
		} catch(e){
			worker = new Worker(window.communist.IEpath);
			worker.postMessage(script);
		}
		return worker;
	}else {
		return new Worker(c.URL.createObjectURL(new Blob([script],{type: "text/javascript"})));	
	}
};
//special case of worker only being called once, instead of sending the data
//we can bake the data into the worker when we make it.
var oneOff = function(fun,data){
	var promise = makePromise();
	var worker = makeWorker(['var _self={};\n_self.fun = ',fun,';\n\
	_self.cb=function(data,transfer){\n\
			self.postMessage(data,transfer);\n\
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
var mapWorker=function(fun,callback,onerr){
	var w = new Communist();
	var worker = makeWorker(['var _close=function(){self.close();};var _db={};\nvar _self={};\n_self.fun = ',fun,';\n\
		_self.cb=function(data,transfer){\n\
			self.postMessage(data,transfer);\n\
		};\n\
		self.onmessage=function(e){\n\
		_self.result = _self.fun(e.data,_self.cb);\n\
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
	w.data=function(d,t){
		worker.postMessage(d,t);	
		return w;
	};
	w.close=function(){
		return worker.terminate();
	};
	return w;
};
var sticksAround = function(fun){
	var w = new Communist();
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
	var func = 'function(data,cb){var _self={};_self.fun = '+fun+';\n\
		_self.numberCB = function(num,d,tran){\n\
			cb([num,d],tran);\n\
		};\n\
		_self.boundCB = _self.numberCB.bind(null,data[0]);\n\
		_self.result = _self.fun(data[1],_self.boundCB);\n\
		if(typeof _self.result !== "undefined"){\n\
			_self.boundCB(_self.result);\n\
		}\n\
	}';
	var callback = function(data){
			promises[data[0]].resolve(data[1]);
			promises[data[0]]=0;
	};
	var worker = mapWorker(func, callback,rejectPromises);
	w.close = function(){
		worker.close();
		rejectPromises("closed");
		return;
	};
	w.data=function(data, transfer){
		var i = promises.length;
		promises[i] = makePromise();
		worker.data([i,data],transfer);
		return promises[i].promise;
	};
	return w;
};
var rWorker = function(fun,callback){
	var w = new Communist();
	var func = 'function(dat,cb){ var fun = '+fun+';\n\
		switch(dat[0]){\n\
			case "data":\n\
				if(!_db._r){\n\
					_db._r = dat[1];\n\
				}else{\n\
					_db._r = fun(_db._r,dat[1]);\n\
				}\n\
				break;\n\
			case "get":\n\
				return cb(_db._r);\n\
			case "close":\n\
				cb(_db._r);\n\
				_close();\n\
				break;\n\
		}\n\
	};'
	var cb =function(data){
		callback(data);	
	};
	var worker = mapWorker(func,cb);
	w.data=function(data,transfer){
		worker.data(["data",data],transfer);
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
var incrementalMapReduce = function(threads){
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
			promise = makePromise();
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
			promise = makePromise();
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
var nonIncrementalMapReduce = function(threads){
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
var c=function(a,b,c){
	if(typeof a !== "number" && typeof b === "function"){
		return mapWorker(a,b,c);
	}else if(typeof a !== "number"){
		return b ? oneOff(a,b):sticksAround(a);
	}else if(typeof a === "number"){
		return b ? incrementalMapReduce(a):nonIncrementalMapReduce(a);
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
		request.send();\n\
	}';
	return c(func,c.makeUrl(url));
};
window.communist=c;
})(RSVP);