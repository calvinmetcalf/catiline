function mapWorker(fun,callback,onerr){
	onerr = onerr || function(){callback();};
	var w = new Communist();
	var obj = {__func__:fun};
	obj.data = function(data){
		var that = this;
		var cb = function(data,transform){
			that.fire('data',data,transform);
		};
		var resp = that.__func__(data,cb);
		if(typeof resp !== "undefined"){
			cb(resp);
		}
	};
	obj.init = function(){
		this.on('data',function(data){
			this.data(data);
		});
	};
	var worker = object(obj);
	w.data=function(data,transfer){
		worker.fire('data',data,transfer);
		return w;
	};
	worker.on('data',callback);
	worker.on('error',onerr);
	w.close=function(){
		return worker.close();
	};
	return w;
}