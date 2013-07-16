function mapWorker(fun,callback,onerr){
	if(typeof Worker === 'undefined'){
		return fakeMapWorker(fun,callback,onerr);
	}
	onerr = onerr || function(){callback();};
	var w = new Communist();
	var obj = {__func__:fun};
	obj.data = function(data){
		var that = this;
		var cb = function(data,transform){
			that.fire('data',data,transform);
		};
		var resp = that.__func__(data);
		if(resp !== "undefined"){
			cb(resp);
		}
	};
	obj.start = function(){
		this.on('data',function(data){
			this.data(data);
		});
	};
	var worker = object(obj);
	var startIt = function(){
		worker.start().then(function(){},function(e){
			onerr(e);
			startIt();
		});
	};
	w.data=function(data,transfer){
		worker.fire('data',data,transfer);
		return w;
	};
	w.close=function(){
		return worker.close();
	};
	return w;
}