function queue(obj,n,cb){
	var w = new Communist();
	w.batch={};
	w.batchTransfer={};
	var workers = new Array(n);
	var numIdle=0;
	var idle=[];
	var queue=[];
	var queueLen=0;
	while(numIdle<n){
		workers[numIdle]=object(obj);
		idle.push(numIdle);
		numIdle++;
	}
	function keyFunc(k){
		return function(data,transfer){
			return doStuff(k,data,transfer);
		};
	}
	function keyFuncBatch(k){
		if(cb){
			return function(array){
				array.forEach(function(data){
					doStuff(k,data).then(cb);
				});
			};
		}else{
			return function(array){
				return c.all(array.map(function(data){
					return doStuff(k,data);
				}));
			};	
		}
			
	}
	function keyFuncBatchTransfer(k){
		if(cb){
			return function(array){
				array.forEach(function(data){
					doStuff(k,data[0],data[1]).then(cb);
				});
			};
		}else{
			return function(array){
				return c.all(array.map(function(data){
					return doStuff(k,data[0],data[1]);
				}));
			};
		}
	}
	obj._close=function(){};
	for(var key in obj){
		w[key]=keyFunc(key);
		w.batch[key]=keyFuncBatch(key);
		w.batchTransfer[key]=keyFuncBatchTransfer(key);
	}
	function done(num){
		var data;
		if(queueLen){
			data = queue.shift();
			queueLen--;
			workers[num][data[0]](data[1],data[2]).then(function(d){
				done(num);
				data[3].resolve(d);
			},function(d){
				done(num);
				data[3].reject(d);
			});
		}else{
			numIdle++;
			idle.push(num);
		}
	}
	function doStuff(key,data,transfer){//srsly better name!
		var promise = c.deferred(),num;
		if(!queueLen && numIdle){
			num = idle.pop();
			numIdle--;
			workers[num][key](data,transfer).then(function(d){
				done(num);
				promise.resolve(d);
			},function(d){
				done(num);
				promise.reject(d);
			});
		}else if(queueLen||!numIdle){
			queueLen=queue.push([key,data,transfer,promise]);
		}
		return promise.promise;
	}
	if(!('close' in w)){
		w.close=w._close;
	}
	return w;
}
