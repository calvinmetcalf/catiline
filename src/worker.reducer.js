function rWorker(fun,callback){
	if(typeof Worker === 'undefined'){
		return fakeReducer(fun,callback);
	}
	var w = new Communist();
	var func = 'function(dat,cb){ var fun = '+fun+';\n\
		switch(dat[0]){\n\
			case "data":\n\
				if(!this._r){\n\
					this._r = dat[1];\n\
				}else{\n\
					this._r = fun(this._r,dat[1]);\n\
				}\n\
				break;\n\
			case "get":\n\
				return cb(this._r);\n\
			case "close":\n\
				cb(this._r);\n\
				this.__close__();\n\
				break;\n\
		}\n\
	};';
	var cb =function(data){
		callback(data);
	};
	var worker = mapWorker(func,cb);
	w.data=function(data,transfer){
		!c._noTransferable?worker.data(["data",data],transfer):worker.data(["data",data]);
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
}
