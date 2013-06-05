function fakeObject(obj){
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
	if(!("initialize" in obj)){
		obj.initialize=function(){};
	}
	var keyFunc=function(key){
		var result;
		var out = function(data){
			var i = promises.length;
			promises[i] = c.deferred();
			var callback = function(data){
				promises[i].resolve(data);
			};
			try{
				result = obj[key](data,callback);
				if(typeof result !== "undefined"){
					callback(result);
				}
			} catch (e){
				promises[i].reject(e);
			}
			return promises[i].promise;
		};
		return out;
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

function fakeSingle(fun,data){
	return multiUse(fun).data(data);
}
function fakeMapWorker(fun,callback,onerr){
	var w = new Communist();
	var worker = fakeObject({data:fun});
	w.data=function(data){
		worker.data(data).then(callback,onerr);
		return w;
	};
	return w;
}