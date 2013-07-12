//special case of worker only being called once, instead of sending the data
//we can bake the data into the worker when we make it.

function single(fun,data){
	if(typeof Worker === 'undefined'||typeof fakeLegacy !== 'undefined'){
		return multiUse(fun).data(data);
	}
	var promise = c.deferred();
	var worker = makeWorker($$fObj$$);
	worker.onmessage=function(e){
		promise.resolve(e.data);
	};
	worker.onerror=function(e){
		e.preventDefault();
		promise.reject(e.message);
	};
	return promise.promise;
}
