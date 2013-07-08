var _db=$$fObj$$;
self.onmessage=function(e){
	var cb=function(data,transfer){
		!self._noTransferable?self.postMessage([e.data[0],data],transfer):self.postMessage([e.data[0],data]);
	};
	var result = _db[e.data[1]](e.data[2],cb);
	if(typeof result !== "undefined"){
		cb(result);
	}
};
_db.initialize();