function queue(obj,n){
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
	obj._close=function(){};
	for(var key in obj){
		w[key]=(function(k){
			return function(data,transfer){
				return doStuff(k,data,transfer);
			}
		})(key);
		w.batch[key]=(function(k){
			return function(array){
				return c.all(array.map(function(data){
					return doStuff(k,data);
				}));
			}
		})(key);
		w.batchTransfer[key]=(function(k){
			return function(array){
				return c.all(array.map(function(data){
					return doStuff(k,data[0],data[1]);
				}));
			}
		})(key);
	};
	function done(num){
		var data;
		if(queueLen){
			data = queue.pop();
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
	function doStuff(key,data,transfer){
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
