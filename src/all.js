c.all=function(array){
	var promise = c.deferred();
	var len = array.length;
	var i = 0;
	var resolved=0;
	var out = new Array(len);
	var onSuccess=function(n){
		return function(v){
			out[n]=v;
			resolved++;
			if(resolved===len){
				promise.resolve(out);
			}
		}
	}
	while(i<len){
		array[i].then(onSuccess(i),function(a){promise.reject(a)});
		i++;
	}
	return promise.promise;
}
