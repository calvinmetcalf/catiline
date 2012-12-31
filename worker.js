var _db = {}
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
 	var message ={cb:_e.data.cb}
 	try {
		message.body=_f.apply(null, _e.data.body);
 	} catch(_err){
 		//message.error="err"
 	} finally{
 	self.postMessage(message);
 	}
});