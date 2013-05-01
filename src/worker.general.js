function mapWorker(fun,callback,onerr){
	var w = new Communist();
	var worker = makeWorker(['\n\
	var _db={};\n\
	_db.__close__=function(){\n\
		self.close();\n\
	};\n\
	var _self={};\n\
	_db.__fun__ = ',fun,';\n\
	_self.cb=function(data,transfer){\n\
		!self._noTransferable?self.postMessage(data,transfer):self.postMessage(data);\n\
	};\n\
	self.onmessage=function(e){\n\
		_self.result = _db.__fun__(e.data,_self.cb);\n\
			if(typeof _self.result !== "undefined"){\n\
				_self.cb(_self.result);\n\
		}\n\
	}']);
	worker.onmessage = function(e){
		callback(e.data);
	};
	if(onerr){
		worker.onerror=onerr;
	}else{
		worker.onerror=function(){callback();};
	}
	w.data=function(data,transfer){
		!c._noTransferable?worker.postMessage(data,transfer):worker.postMessage(data);	
		return w;
	};
	w.close=function(){
		return worker.terminate();
	};
	return w;
};