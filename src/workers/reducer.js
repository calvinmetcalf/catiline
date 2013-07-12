function rWorker(fun,callback){
	if(typeof Worker === 'undefined'||typeof fakeLegacy !== 'undefined'){
		return fakeReducer(fun,callback);
	}
	var w = new Communist();
	var func = $$fObj$$;
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
