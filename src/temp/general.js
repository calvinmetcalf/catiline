function mapWorker(fun,callback,onerr){
	if(typeof Worker === 'undefined'){
		return fakeMapWorker(fun,callback,onerr);
	}
	var w = new Communist();
	var worker = makeWorker(['var _db = {};_db.__close__ = function () {	self.close();};var _self = {};_db.__fun__ = ',fun,';_self.cb = function (data, transfer) {	!self._noTransferable ? self.postMessage(data, transfer) : self.postMessage(data);};self.onmessage = function (e) {	_self.result = _db.__fun__(e.data, _self.cb);	if (typeof _self.result !== "undefined") {		_self.cb(_self.result);	}}']);
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
}