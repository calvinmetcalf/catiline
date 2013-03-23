function sticksAround(fun){
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
function rWorker(fun,callback){
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
function objWorker(obj){
	var w = new Communist();
	var keys = Object.keys(obj);
	var fun = 'function(data,cb){\n\
		var cont\n\
		if(data[0]==="__start__"){\n\
			_self.obj = '+obj+'\n\
		}\n\
		else{\n\
		cont =data[1];\n\
		cont.push(cb)\n\
		return _self.obj[data[0]].apply(null,cont);\n\
		}\n\
	}';
	var worker = sticksAround(fun);
	worker.data(["__start__"]);
	var i = 0;
	var len = keys.length;
	while(i<len){
		w[keys[i]]=function(){
			return worker.data([w[keys[i]],Array.prototype.slice.call(arguments)]);
		};
		i++;
	}
	return w;
}
function c(a,b,c){
	if(typeof a !== "number" && typeof b === "function"){
		return mapWorker(a,b,c);
	}else if(typeof a !== "number"){
		return b ? oneOff(a,b):sticksAround(a);
	}else if(typeof a === "number"){
		return !b ? incrementalMapReduce(a):nonIncrementalMapReduce(a);
	}else if(typeof a === "object" && !Array.isArray(a)){
		return objWorker(a);
	}
};
c.reducer = rWorker;
c.worker = makeWorker;