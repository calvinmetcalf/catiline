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
	var func = 'function(data,cb){this.func = '+fun+';\n\
		_self.boundCB = function(d,tran){\n\
			!self._noTransferable?cb([data[0],d],tran):cb([data[0],d]);\n\
		};\n\
		_self.results = this.func(data[1],_self.boundCB);\n\
		if(typeof _self.results !== "undefined"){\n\
			_self.boundCB(_self.results);\n\
		}\n\
	}';
	var callback = function(data){
			promises[data[0]].resolve(data[1]);
			promises[data[0]]=0;
	};
	var worker = mapWorker(func, callback, rejectPromises);
	w.close = function(){
		worker.close();
		rejectPromises("closed");
		return;
	};
	w.data=function(data, transfer){
		var i = promises.length;
		promises[i] = c.deferred();
		!c._noTransferable?worker.data([i,data],transfer):worker.data([i,data]);
		return promises[i].promise;
	};
	return w;
};