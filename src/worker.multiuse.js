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
	var worker = makeWorker(['\n\
	this.__close__=function(){\n\
		self.close();\n\
	};\n\
	var _db={};\n\
	var _self={};\n\
	_db.__fun__ = ',fun,';\n\
	self.onmessage=function(e){\n\
	var cb=function(data,transfer){\n\
		!self._noTransferable?self.postMessage([e.data[0],data],transfer):self.postMessage([e.data[0],data]);\n\
	};\n\
		var result = _db.__fun__(e.data[1],cb);\n\
			if(typeof result !== "undefined"){\n\
				cb(result);\n\
			}\n\
	}']);
	worker.onmessage= function(e){
			promises[e.data[0]].resolve(e.data[1]);
			promises[e.data[0]]=0;
	};
	worker.onerror=rejectPromises;
	w.close = function(){
		worker.close();
		rejectPromises("closed");
		return;
	};
	w.data=function(data, transfer){
		var i = promises.length;
		promises[i] = c.deferred();
		!c._noTransferable?worker.postMessage([i,data],transfer):worker.postMessage([i,data]);
		return promises[i].promise;
	};
	return w;
};