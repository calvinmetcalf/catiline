defaultFunc = """var _db = {}
_db._add=function(name, func){
	_db[name]=eval("("+func+")");
	return true;	
};	
_db._rm=function(name){
	delete _db[name];		
	return true;
};
_db._test=function(a){
	return a || "all quiet";
};
var _f =  function () {
    var args, method,__slice = [].slice;
    method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return _db[method].apply(null, args);
  };
 self.addEventListener('message', function(_e) {
 	self.send = function(data){
 		self.postMessage({
 			messege:data,cb:_e.data.cb
 		});
 	};
	self.postMessage({
 		cb:_e.data.cb,
 		body:_f.apply(null, _e.data.body)
 		});
 	
});"""

class Communist 
	constructor : (fun) ->
		window.URL = window.URL or window.webkiURL
		if fun
			fun = fun.toString()
			body = "var send;var _f =  #{ fun };self.addEventListener('message', function(_e) {send = function(data){self.postMessage({message:data,cb:_e.data.cb})};self.postMessage({body:_f.apply(null, _e.data.body),cb:_e.data.cb})})"
		else
			body = defaultFunc
		blob = new Blob [body],
			type: "text/javascript"
		bUrl = window.URL.createObjectURL(blob)
		@_worker = new Worker(bUrl)
		@
	CBs : {}
	send : (data..., cb=()->true) =>
		id = ("" + Math.random()).slice(2)
		@CBs[id] = cb
		@_worker.postMessage {body:data,cb : id}
		@_worker.onmessage = (e) =>
			if  e.data.body
				@CBs[e.data.cb] null, e.data.body
				delete @CBs[e.data.cb]
			else if e.data.message
				@CBs[e.data.cb] null,e.data.message
			true
		@_worker.onerror = (e) ->
			cb e
			true
		true
	add : (method, func, cb=()->true)->
		@send("_add",method,(func.toString()),cb)
		true
	remove : (method,cb=()->true)->
		@send("_rm",method,cb)
		true
	close : () ->
		@_worker.terminate()
		true
	true 
window.Communist = Communist