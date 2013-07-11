function fakeObject(obj){
	var w = new Communist();
	var promises = [];
	var wlisteners = {};
	var olisteners={};
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
	var keyFunc=function(key){
		return function(data){
			var result;
			var i = promises.length;
			promises[i] = c.deferred();
			var callback = function(data){
				promises[i].resolve(data);
			};
			try{
				result = obj[key].call(obj,data,callback);
				if(typeof result !== "undefined"){
					callback(result);
				}
			} catch (e){
				promises[i].reject({preventDefault:function(){},messege:e});
			}
			return promises[i].promise;
		};
	};
	for(var key in obj){
		w[key]=keyFunc(key);
	}
	w.on=function(eventName,func,scope){
		scope = scope || w;
		if(eventName.indexOf(' ')>0){
			eventName.split(' ').map(function(v){
				return w.on(v,func,scope);
			},this);
			return w;
		}
		if(!(eventName in wlisteners)){
			wlisteners[eventName]=[];
		}
		wlisteners[eventName].push(function(a){
			func.call(scope,a);
		});
	};
	w.fire=function(eventName,data){
		if(!(eventName in olisteners)){
			return w;
		}
		olisteners[eventName].forEach(function(v){
			v(data);
		});
		return w;
	};
	w.off = function (eventName, func) {
		if(eventName.indexOf(' ')>0){
			eventName.split(' ').map(function(v){
				return w.off(v,func);
			});
			return w;
		}
		if (!(eventName in wlisteners)) {
			return w;
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
		return w;
	};
	obj.on=function(eventName,func,scope){
		scope = scope || obj;
		if(eventName.indexOf(' ')>0){
			eventName.split(' ').map(function(v){
				return obj.on(v,func,scope);
			},this);
			return obj;
		}
		if(!(eventName in olisteners)){
			olisteners[eventName]=[];
		}
		olisteners[eventName].push(function(a){
			func.call(scope,a);
		});
		return obj;
	};
	obj.fire=function(eventName,data){
		if(!(eventName in wlisteners)){
			return obj;
		}
		wlisteners[eventName].forEach(function(v){
			v(data);
		});
		return obj;
	};
	obj.off = function (eventName, func) {
		if(eventName.indexOf(' ')>0){
			eventName.split(' ').map(function(v){
				return obj.off(v,func);
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
	w._close = function(){
		olisteners={};
		wlisteners={};
		promises.forEach(function(a){
			a.reject("closed");
		});
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
