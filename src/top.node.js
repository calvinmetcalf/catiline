var promiscuous=require("promiscuous");
function makePromise(){
	var p= promiscuous.deferred();
	return p;
}
//this is mainly so the name shows up when you look at the object in the console
var Communist = function(){};
//accepts an array of strings, joins them, and turns them into a worker.
function makeWorker(strings){
	var worker = require("child_process").fork("./node.js");
	var script = strings.join("");
	worker.send({data:script});
	return worker;
};
//special case of worker only being called once, instead of sending the data
//we can bake the data into the worker when we make it.
function oneOff(fun,data){
	var promise = makePromise();
	var worker = makeWorker(['\
	var domain = require("domain");\n\
	var d = domain.create();\n\
	d.on("error", function(e) {\n\
		process.send({"err":e});\n\
		process.exit();\n\
	});\n\
	d.run(function() {\n\
	var _self={};\n_self.fun = ',fun,';\n\
	_self.cb=function(data){\n\
			process.send({data:data});\n\
		};\n\
		_self.result = _self.fun(',JSON.stringify({data:data}),'.data,_self.cb);\n\
		if(typeof _self.result !== "undefined"){\n\
			_self.cb(_self.result);\n\
		}\n\
		})']);
		worker.on("message",function(e){
			if(e.data){
				promise.resolve(e.data);
			}else if(e.err){
				promise.reject(e.err);
			}
	});
	return promise.promise;
};
function mapWorker(fun,callback, onerr){
	var w = new Communist();
	var worker = makeWorker(['\
		var _close=function(){process.exit();};\n\
		var _db={};\n\
		var _self={};\n\
		_self.fun = ',fun,';\n\
		_self.cb=function(data){\n\
			process.send({"data":data});\n\
		};\n\
		process.on("message",function(e){\n\
			var domain = require("domain");\n\
	var d = domain.create();\n\
	d.on("error", function(e) {\n\
		process.send({"err":e});\n\
	});\n\
				d.run(function() {\n\
					_self.result = _self.fun(JSON.parse(e).data,_self.cb);\n\
				});\n\
				if(typeof _self.result !== "undefined"){\n\
					_self.cb(_self.result);\n\
				}\n\
	})']);
	worker.on("message" , function(e){
		if(e.data){
			callback(e.data);
		}else if(e.err){
			if(onerr){
				onerr(e.err);
			}else{
				callback();
			}
		}
	});
	w.data=function(d){
		worker.send(JSON.stringify({data:d}));	
		return w;
	};
	w.close=function(){
		return worker.kill();
	};
	return w;
};