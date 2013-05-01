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
	};';
	var cb =function(data){
		callback(data);	
	};
	var worker = mapWorker(func,cb);
	w.data=function(data,transfer){
		(transfer&&!c._noTransferable)?worker.data(["data",data],transfer):worker.data(["data",data]);
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