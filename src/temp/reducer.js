function rWorker(fun,callback){
	if(typeof Worker === 'undefined'){
		return fakeReducer(fun,callback);
	}
	var w = new Communist();
	var func = ['function (dat, cb) {	var fun = ',fun,';	switch (dat[0]) {	case "data":		if (!this._r) {			this._r = dat[1];		}		else {			this._r = fun(this._r, dat[1]);		}		break;	case "get":		return cb(this._r);	case "close":		cb(this._r);		this.__close__();		break;	}};'];
	var cb =function(data){
		callback(data);
	};
	var worker = mapWorker(func.join(''),cb);
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
