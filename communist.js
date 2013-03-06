(function(){
	var Communist = function(){};
	var makeWorker = function(strings){
		var URL = window.URL || window.webkitURL || self.URL;
		return new Worker(URL.createObjectURL(new Blob([strings.join("")],{type: "text/javascript"})));	
	};
	var oneOff = function(fun,data){
		var promise = new RSVP.Promise();
		var worker = makeWorker(['var fun = ',fun,';\
		function _clb(data,transfer){\
				self.postMessage(data,transfer);\
				self.close();\
			}\
			var _rst = fun(',JSON.stringify(data),',_clb);\
			if(typeof _rst !== "undefined"){\
				_clb(_rst);\
			}']);
		worker.onmessage=function(e){
			promise.resolve(e.data);
		};
		worker.onerror=function(e){
			promise.reject(e);
		};
		return promise;
	};
	var mapWorker=function(fun,callback,onerr){
		var w = new Communist();
		var worker = makeWorker(['var _db={};var fun = ',fun,';\
			function _clb(data,transfer){\
				self.postMessage(data,transfer);\
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
		worker.onerror=onerr||function(){callback();};
		w.data=function(d,t){
			worker.postMessage(d,t);	
			return w;
		};
		w.close=function(){
			return worker.terminate();
		};
		return w;
	};
	var sticksAround = function(fun){
		var w = new Communist();
		var promises = [];
		var rejectPromises = function(msg){
			promises.forEach(function(p){
				if(p){
					p.reject(msg);
				}	
			});
		};
		var func = 'function(data,cb){var _fun = '+fun+';\
			var _nCB = function(num,d,tran){\
			cb([num,d],tran);\
			};\
			var _bCB = _nCB.bind(self,data[0]);\
			var _nR = _fun(data[1],_bCB);\
			if(typeof _nR !== "undefined"){\
				_bCB(_nR);\
			}\
		}';
		var callback = function(data){
				promises[data[0]].resolve(data[1]);
				promises[data[0]]=0;
		};
		var worker = mapWorker(func, callback,rejectPromises);
		w.close = function(){
			worker.close();
			rejectPromises("closed");
			return;
		};
		w.data=function(data, transfer){
			var i = promises.length;
			promises[i] = new RSVP.Promise();
			worker.data([i,data],transfer);
			return promises[i];
		};
		return w;
	};
	var rWorker = function(fun,callback){
		var w = new Communist();
		var func = 'function(dat,cb){ var fun = '+fun+';\
			switch(dat[0]){\
				case "data":\
					if(!_db._r){\
						_db._r = dat[1];\
					}else{\
						_db._r = fun(_db._r,dat[1]);\
					}\
					break;\
				case "get":\
					return cb(_db._r);\
				case "close":\
					cb(_db._r);\
					self.close();\
					break;\
			}\
		};'
		var cb =function(data){
			callback(data);	
		};
		var worker = mapWorker(func,cb);
		w.data=function(data,transfer){
			worker.data(["data",data],transfer);
			return w;
		};
		w.fetch=function(){
			worker.data(["get"]);
			return w;
		};
		w.close=function(silent){
			if(silent){
				callback=function(){};
			}
			worker.data(["close"]);
			return;
		};
		return w;
	};
	var nonIncrementalMapReduce = function(threads){
		var data=[];
		var len = 0;
		var reducer;
		var w = new RSVP.Promise();
		var workers = [];
		var terminated = threads;
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
		w.map=function(fun,t){
			if(status.map){
				return w;
			}
			var i = 0;
			while(i<threads){
				var dd;
				(function(){
					var mw = mapWorker(fun, function(d){
						if(typeof d !== undefined){
							reducer.data(d);
						}
						if(len>0){
							len--;
							dd = data.pop();
							if(t){
								mw.data(dd,[dd]);
							}else{
							mw.data(dd);
							}
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
				terminated--;
			}
			w.data=function(){
				w.reject("can't add data, already called.");
				return w;
			};
			return w;
		}
		return w;
	};
	var incrementalMapReduce = function(threads){
		var w = new Communist();
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
		w.map=function(fun, t){
			if(status.map){
				return w;
			}
			var i = 0;
			while(i<threads){
				(function(){
					var dd;
					var mw = mapWorker(fun, function(d){
						if(typeof d !== undefined){
							reducer.data(d);
						}
						if(len>0){
							len--;
							dd = data.pop();
							if(t){
								mw.data(dd,[dd]);
							}else{
							mw.data(dd);
							}
						}else{ 
							idle++;
							if(idle===threads){
								status.data=false;
								if(closing){
								closeUp();
								}else if(waiting){
									waiting = false;
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
				}
			});
			status.reduce=true;
			return checkStatus();
		};
		w.data = function(d){
			if(closing){
				return;
			}
			len = len + d.length;
			data = data.concat(d);
			status.data=true;
			return checkStatus();
		};
		function go(){
			var i = 0;
			var wlen = workers.length;
			while(i<wlen && len>0 && idle>0){
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
			if(idle<threads && !now){
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
			if(idle<threads){
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
			return mapWorker(a,b);
		}else if(typeof a === "function" || typeof a === "string"){
			return b ? oneOff(a,b):sticksAround(a);
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
		var txt=!notjson?'JSON.parse(request.responseText)':"request.responseText";
		var resp = after?"("+after.toString()+")("+txt+",cb)":txt;
		var func = 'function (url, cb) {\
			var request = new XMLHttpRequest();\
			request.open("GET", url);\
				request.onreadystatechange = function() {\
					var _resp;\
					if (request.readyState === 4 && request.status === 200) {'+
						'_resp = '+resp+';\
						if(typeof _resp!=="undefined"){cb(_resp);}\
						}\
				};\
			request.send();\
		}';
		return p(func,p.makeUrl(url));
	};
	p.reducer = rWorker;
	p.worker = makeWorker;
	window.communist=p;
})();