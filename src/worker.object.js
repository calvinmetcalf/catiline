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
	}\n\
	_db.initialize()']);
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
