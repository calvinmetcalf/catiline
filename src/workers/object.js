function object(obj){
	if(typeof Worker === 'undefined'){
		return fakeObject(obj);
	}
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
			!c._noTransferable?worker.postMessage([['promise',i],key,data],transfer):worker.postMessage([['promise',i],key,data]);
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
		if(e.data[0]==='promise'){
			promises[e.data[0][1]].resolve(e.data[1]);
			promises[e.data[0][1]]=0;
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
