function dumbQueue(obj,n,cb){
	var w = new Communist();
	w.batch={};
	w.batchTransfer={};
	var workers = new Array(n);
	var numIdle=0;
	var idle=[];
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
	function doStuff(key,data,transfer){//srsly better name!
			return workers[~~(Math.random()*n)][key](data,transfer);
	}
	if(!('close' in w)){
		w.close=w._close;
	}
	return w;
}
