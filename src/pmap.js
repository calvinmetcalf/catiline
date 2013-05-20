function pMap2(list, fun, n){
	var w = {};
	var workerFunc = ['self.onmessage=function(e){\n\
			self.postMessage(e.data.map(',fun,'));\n\
            self.close();\n\
	}']

	var promise = communist.deferred();
    var d = 0;
    var sl = sliceup(list,n);
    var sll = sl.length;
    var temp = new Array(sll);
    sl.forEach(function(v,i){
    var worker = communist.worker(workerFunc);
    worker.onmessage=function(e){
        d++;
        temp[i]=e.data;
        if(d===sll){
            promise.resolve(Array.prototype.concat.apply([],temp));
        }
    };
    worker.postMessage(list.slice(v[0],v[1]));
    
    
    });
	return promise.promise;
}
function sliceup(a,p){
    var len = a.length;
    var out = [];
    var inter = ~~(len/p);
    var start = 0;
    var end = inter;
    out.push([start,end]);
    while(end<len){
        start = end;
        end +=inter;
        out.push([start,end]);
    }
    return out;
}