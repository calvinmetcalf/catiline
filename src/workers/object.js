function object(obj){
	if(typeof Worker === 'undefined'){
		return fakeObject(obj);
	}
	var listeners = {};
	var w = new Communist();
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
	var _fire=function(eventName,data){
		if(!(eventName in listeners)){
			return;
		}
		listeners[eventName].forEach(function(v){
			v(data);
		});
	};
	w.fire = function(eventName,data,transfer){
		!c._noTransferable?worker.postMessage([[eventName],data],transfer):worker.postMessage([[eventName],data]);
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
		if('init' in obj){
			obj.initialize=obj.init;
		}else{
			obj.initialize=function(){};
		}
	}
	var fObj="{";
	var keyFunc=function(key){
		var out = function(data, transfer){
			var i = promises.length;
			promises[i] = c.deferred();
			!c._noTransferable?worker.postMessage([['com.communistjs',i],key,data],transfer):worker.postMessage([['com.communistjs',i],key,data]);
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
	
	var worker = makeWorker($$fObj$$);
	worker.onmessage= function(e){
		if(e.data[0][0]==='com.communistjs'){
			promises[e.data[0][1]].resolve(e.data[1]);
			promises[e.data[0][1]]=0;
		}else{
			_fire(e.data[0][0],e.data[1]);
		}
	};
	worker.onerror=rejectPromises;
	w._close = function(){
		worker.terminate();
		rejectPromises("closed");
		return c.resolve();
	};
	if(!('close' in w)){
		w.close=w._close;
	}

	return w;
}
