c.all=function(array){
	var promise = c.deferred();
	var len = array.length;
	var resolved=0;
	var out = new Array(len);
	var onSuccess=function(n){
		return function(v){
			out[n]=v;
			resolved++;
			if(resolved===len){
				promise.resolve(out);
			}
		};
	};
		array.forEach(function(v,i){
			v.then(onSuccess(i),function(a){
				promise.reject(a);
			});
		});
	return promise.promise;
};
