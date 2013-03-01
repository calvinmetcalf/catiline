(function(){
    var makeWorker = function(strings){
    return new Worker(URL.createObjectURL(new Blob([strings.join("")],{type: "text/javascript"})));	
	};
	var fAndF = function(fun,data){
		var promise = new RSVP.Promise();
		var worker = makeWorker(['var fun = ',fun,';\
		function _clb(data){\
				self.postMessage(data);\
				self.close();\
			}\
			self.onmessage=function(){\
			var _rst = fun(',JSON.stringify(data),',_clb);\
			if(typeof _rst !== "undefined"){\
				_clb(_rst);\
			}\
			}']);
		worker.onmessage=function(e){
			promise.resolve(e.data);
		};
		worker.onerror=function(e){
			promise.reject(e);
		};
		worker.postMessage("");
		return promise;
	};
	var sticksAround = function(fun){
		var w = {};
		var promises = [];
		var worker = makeWorker(['var fun=', fun,';\
			function _clb(num,data){\
				self.postMessage([num,data]);\
			}\
			self.onmessage=function(event){\
				var _cc = _clb.bind(self, event.data[0]);\
				var _rst = fun(event.data[1],_cc);\
				if(typeof _rst !== "undefined"){\
					_cc(_rst)\
				}\
				}']);
		var rejectPromises = function(msg){
			promises.forEach(function(p){
				if(p){
					p.reject(msg);
				}	
			});
		};
		worker.onerror=rejectPromises;
		w.data=function(data){
			var i = promises.length;
			promises[i] = new RSVP.Promise();
			worker.onmessage=function(e){
				promises[e.data[0]].resolve(e.data[1]);
				promises[e.data[0]]=0;
			};
			worker.postMessage([i,data]);
			return promises[i];
		};
		w.close = function(){
			w.worker.terminate();
			rejectPromises("closed");
			return;
		};
		return w;
	};
	var mWorker=function(fun,callback){
		var w ={};
		var worker = makeWorker(['var fun = ',fun,';\
			function _clb(data){\
				self.postMessage(data);\
			}\
			self.onmessage=function(e){\
			var _rst = fun(e.data,_clb);\
				if(typeof _rst !== "undefined"){\
					_clb(_rst);\
				}\
			}']);
		worker.onmessage = function(e){
			callback(e.data);	
		};
		w.data=function(d){
			worker.postMessage(d);	
		};
		w.close=function(){
			return worker.terminate();
		};
		return w;
	};
	var rWorker = function(fun,callback){
		var w = {};
		var worker = makeWorker(['var fun = ',fun,',reduced,reduceEmpty=true;\
		self.onmessage=function(event){\
			switch(event.data[0]){\
				case "data":\
					if(reduceEmpty){\
						reduced = event.data[1];\
						reduceEmpty = false;\
					}else{\
						reduced = fun(reduced,event.data[1]);\
					}\
					break;\
				case "get":\
					self.postMessage(reduced);\
					break;\
				case "close":\
					self.postMessage(reduced);\
					self.close();\
					break;\
			}\
		};']);
		worker.onmessage=function(e){
			callback(e.data);	
		};
		w.data=function(data){
			worker.postMessage(["data",data]);
		};
		w.fetch=function(){
			worker.postMessage(["get"]);
		};
		w.close=function(silent){
			if(silent){
				callback=function(){};
			}
			worker.postMessage(["close"]);
		};
		return w;
	};
	var nonIncrementalMapReduce = function(threads){
		var data=[];
		var len = 0;
		var reducer;
		var w = new RSVP.Promise();
		var workers = [];
		var terminated = 0;
		var status = {
			map:false,
			reduce:false,
			data:false
		};
		var checkStatus = function(){
			if(status.map && status.reduce && status.data){
				return go();
			}else{
				return w;
			}
		};
		w.map=function(fun){
			if(status.map){
				return w;
			}
			var i = 0;
			while(i<threads){
				(function(){
					var mw = mWorker(fun, function(d){
						reducer.data(d);
						if(len>0){
							len--;
							mw.data(data.pop());
						}else{
							terminated++;
							mw.close();
							if(terminated===threads){
								reducer.close();
							}
						}
					});
				workers.push(mw);
				})();
				i++;
			}
			status.map=true;
			return checkStatus();
		};
		w.reduce=function(fun){
			if(status.reduce){
				return w;
			}
			reducer = rWorker(fun,function(d){
				w.resolve(d);
			});
			status.reduce=true;
			return checkStatus();
		};
		w.data = function(d){
			len = len + d.length;
			data = data.concat(d);
			status.data=true;
			return checkStatus();
		};
		function go(){
			var i = 0;
			var wlen = workers.length;
			while(i<wlen && len>0){
				len--;
				workers[i].data(data.pop());
				i++;
			}
			return w;
		}
		return w;
	};
	var incrementalMapReduce = function(threads){
		var w = {};
		var len = 0;
		var promise;
		var workers = [];
		var data=[];
		var idle = threads;
		var reducer;
		var waiting=false;
		var closing=false;
		var status = {
			map:false,
			reduce:false,
			data:false
		};
		var checkStatus = function(){
			if(status.map && status.reduce && status.data){
				return go();
			}else{
				return w;
			}
		};
		w.map=function(fun){
			if(status.map){
				return w;
			}
			var i = 0;
			while(i<threads){
				(function(){
					var mw = mWorker(fun, function(d){
						reducer.data(d);
						if(len>0){
							len--;
							mw.data(data.pop());
						}else{ 
							idle++;
							if(idle===threads){
								status.data=false;
								if(closing){
								closeUp();
								}else if(waiting){
									reducer.fetch();
								}
							}
						}
					});
				workers.push(mw);
				})();
				i++;
			}
			status.map=true;
			return checkStatus();
		};
		w.reduce=function(fun){
			if(status.reduce){
				return w;
			}
			reducer = rWorker(fun,function(d){
				if(promise){
				promise.resolve(d);
				promise = false;
				};
			});
			status.reduce=true;
			return checkStatus();
		};
		w.data = function(d){
			len = len + d.length;
			data = data.concat(d);
			status.data=true;
			return checkStatus();
		};
		function go(){
			var i = 0;
			var wlen = workers.length;
			while(i<wlen && len>0 && !idle.length){
				len--;
				workers[i].data(data.pop());
				i++;
				idle--;
			}
			return w;
		}
		w.fetch=function(now){
			if(!promise){
			promise = new RSVP.Promise();
		}
			if(data.length && !now){
				waiting=true;
			}else{
				reducer.fetch();
			}
			return promise;
		};
		w.close=function(){
			if(!promise){
			promise = new RSVP.Promise();
		}
			if(data.length){
				closing=true;
			}else{
				closeUp();
			}
			return promise;
		};
		function closeUp(){
			reducer.close();
			workers.forEach(function(v){
				v.close();	
			});
		}
		return w;
	};
	var p=function(a,b){
		if(typeof a === "function" && typeof b === "function"){
			return mWorker(a,b);
		}else if(typeof a === "function" || typeof a === "string"){
			return b ? fAndF(a,b):sticksAround(a);
		}else if(typeof a === "number"){
			return b ? incrementalMapReduce(a):nonIncrementalMapReduce(a);
		}
	};
	p.makeUrl = function (fileName) {
		var link = document.createElement("link");
		link.href = fileName;
		return link.href;
	};
	p.ajax = function(url,after,notjson){
		var resp = after?"("+after.toString()+")(request.responseText)":"request.responseText";
		var func = 'function (url, cb) {\
			var request = new XMLHttpRequest();\
			request.open("GET", url);\
				request.onreadystatechange = function() {\
					if (request.readyState === 4 && request.status === 200) {'+
						(!notjson?'cb(JSON.parse('+resp+'));':'cb('+resp+');')+'\
						}\
				};\
			request.send();\
		}';
		return window.parallel(func,p.makeUrl(url));
	};
	p.reducer = rWorker;
	window.communist=p;
})();