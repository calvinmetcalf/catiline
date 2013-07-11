function fakeObject(obj){
	var w = new Communist();
	var promises = [];
	var listeners = {};
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
		if('init' in obj){
			obj.initialize=obj.init;
		}else{
			obj.initialize=function(){};
		}
	}
	w.on=function(eventName,func,scope){
		scope = scope || w;
		if(eventName.indexOf(' ')>0){
			return eventName.split(' ').map(function(v){
				return w.on(v,func,scope);
			},this);
		}
		if(!(eventName in listeners)){
			listeners[eventName]=[];
		}
		listeners[eventName].push(function(a){
			func.call(scope,a);
		});
	};
	w.fire=function(eventName,data){
		if(!(eventName in listeners)){
			return;
		}
		listeners[eventName].forEach(function(v){
			v(data);
		});
	};
	w.off = function (eventName, func) {
		if(eventName.indexOf(' ')>0){
			return eventName.split(' ').map(function(v){
				return w.off(v,func);
			});
		}
		if (!(eventName in listeners)) {
			return;
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
	};
	var keyFunc=function(key){
		return function(data){
			var result;
			var i = promises.length;
			promises[i] = c.deferred();
			var callback = function(data){
				promises[i].resolve(data);
			};
			try{
				result = obj[key].call(w,data,callback);
				if(typeof result !== "undefined"){
					callback(result);
				}
			} catch (e){
				promises[i].reject(e);
			}
			return promises[i].promise;
		};
	};
	for(var key in obj){
		w[key]=keyFunc(key);
	}
	w._close = function(){
		return c.resolve();
	};
	if(!('close' in w)){
		w.close=w._close;
	}
w.initialize();
	return w;
}

function fakeMapWorker(fun,callback,onerr){
	var w = new Communist();
	var worker = fakeObject({data:fun});
	w.data=function(data){
		worker.data(data).then(callback,onerr);
		return w;
	};
	w.close=worker.close;
	return w;
}

function fakeReducer(fun,callback){
	var w = new Communist();
	var accum;
	w.data=function(data){
		accum=accum?fun(accum,data):data;
		return w;
	};
	w.fetch=function(){
		callback(accum);
		return w;
	};
	w.close=function(silent){
		if(!silent){
			callback(accum);
		}
		return;
	};
	return w;
}
