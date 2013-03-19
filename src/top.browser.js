
function makePromise(){
	return c.deferred();
}
//this is mainly so the name shows up when you look at the object in the console
var Communist = function(){};
//regex out the importScript call and move it up to the top out of the function.
function moveImports(string){
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
function makeWorker(strings){
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
function oneOff(fun,data){
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
function mapWorker(fun,callback,onerr){
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