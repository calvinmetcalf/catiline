//special case of worker only being called once, instead of sending the data
//we can bake the data into the worker when we make it.

communist.single = function (fun,data){
	if(typeof Worker === 'undefined'||typeof fakeLegacy !== 'undefined'){
		return communist.worker(fun).data(data);
	}
	var promise = communist.deferred();
	var obj = {
		fun:fun,
		data:JSON.stringify(data),
		init:function(){
			var that = this;
			var data = JSON.parse(this.data);
			var cb = function(data,trans){
				that.fire('done',data,trans);
			};
			var resp = that.fun(data,cb);
			if(typeof resp !== 'undefined'){
				cb(resp);
			}
		}
	};
	var worker = communist.worker(obj);
	worker.on('done',function(e){
		promise.resolve(e);
		worker.close();
	});
	worker.on('error',function(e){
		e.preventDefault();
		promise.reject(e.message);
		worker.close();
	});
	return promise.promise;
};
