communist.queue = function (obj,n,dumb){
	var w = new Communist();
	w.__batchcb__=new Communist();
	w.__batchtcb__=new Communist();
	w.batch = function(cb){
		if(typeof cb === 'function'){
			w.__batchcb__.__cb__=cb;
			return w.__batchcb__;
		}else{
			return clearQueue(cb);
		}
	};
	w.batchTransfer = function(cb){
		if(typeof cb === 'function'){
			w.__batchtcb__.__cb__=cb;
			return w.__batchtcb__;
		}else{
			return clearQueue(cb);
		}
	};
	var workers = new Array(n);
	var numIdle=0;
	var idle=[];
	var que=[];
	var queueLen=0;
	while(numIdle<n){
		workers[numIdle]=communist.worker(obj);
		idle.push(numIdle);
		numIdle++;
	}
	w.on=function(eventName,func,context){
		workers.forEach(function(worker){
			worker.on(eventName,func,context);
		});
		return w;
	};
	w.off=function(eventName,func,context){
		workers.forEach(function(worker){
			worker.off(eventName,func,context);
		});
		return w;
	};
	var batchFire = function(eventName,data){
		workers.forEach(function(worker){
			worker.fire(eventName,data);
		});
		return w;
	};
	w.fire = function(eventName,data){
		workers[~~(Math.random()*n)].fire(eventName,data);
		return w;
	};
	w.batch.fire = batchFire;
	w.batchTransfer.fire = batchFire;
	function clearQueue(mgs){
		mgs = mgs || 'canceled';
		queueLen = 0;
		var oQ = que;
		que = [];
		oQ.forEach(function(p){
			p[3].reject(mgs);
		});
		return w;
	}
	function keyFunc(k){
		return function(data,transfer){
			return doStuff(k,data,transfer);
		};
	}
	function keyFuncBatch(k){
		return function(array){
			return communist.all(array.map(function(data){
				return doStuff(k,data);
			}));
		};
	}
	function keyFuncBatchCB(k){
		return function(array){
			var self = this;
			return communist.all(array.map(function(data){
				return doStuff(k,data).then(self.__cb__);
			}));
		};
	}
	function keyFuncBatchTransfer(k){
		return function(array){
			return communist.all(array.map(function(data){
				return doStuff(k,data[0],data[1]);
			}));
		};
	}
	function keyFuncBatchTransferCB(k){
		return function(array){
			var self = this;
			return communist.all(array.map(function(data){
				return doStuff(k,data[0],data[1]).then(self.__cb__);
			}));
		};
	}
	for(var key in obj){
		w[key]=keyFunc(key);
		w.batch[key]=keyFuncBatch(key);
		w.__batchcb__[key]=keyFuncBatchCB(key);
		w.batchTransfer[key]=keyFuncBatchTransfer(key);
		w.__batchtcb__[key]=keyFuncBatchTransferCB(key);
	}
	function done(num){
		var data;
		if(queueLen){
			data = que.shift();
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
		if(dumb){
			return workers[~~(Math.random()*n)][key](data,transfer);
			}
		var promise = communist.deferred(),num;
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
			queueLen=que.push([key,data,transfer,promise]);
		}
		return promise.promise;
	}
	w._close = function(){
		return communist.all(workers.map(function(ww){
			return ww._close();
		}));
	};
	if(!('close' in w)){
		w.close=w._close;
	}
	return w;
};
