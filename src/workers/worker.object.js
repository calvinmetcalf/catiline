var _db = $$fObj$$;
var listeners = {};
_db.on = function (eventName, func, scope) {
	if(eventName.indexOf(" ")>0){
		return eventName.split(" ").map(function(v){
			return _db.on(v,func,scope);
		},_db);
	}
	scope = scope || _db;
	if (!(eventName in listeners)) {
		listeners[eventName] = [];
	}
	listeners[eventName].push(function (a) {
		func.call(scope, a);
	});
};
var _fire = function (eventName, data) {
	if (!(eventName in listeners)) {
		return;
	}
	listeners[eventName].forEach(function (v) {
		v(data);
	});
};
_db.fire = function (eventName, data, transfer) {
	!self._noTransferable ? self.postMessage([
		[eventName], data], transfer) : self.postMessage([
		[eventName], data]);
};
_db.off=function(eventName,func){
	if(eventName.indexOf(" ")>0){
		return eventName.split(" ").map(function(v){
			return _db.off(v,func);
		});
	}
	if(!(eventName in listeners)){
		return;
	}else if(!func){
		delete listeners[eventName];
	}else{
		if(listeners[eventName].indexOf(func)>-1){
			if(listeners[eventName].length>1){
				delete listeners[eventName];
			}else{
				listeners[eventName].splice(listeners[eventName].indexOf(func),1);
			}
		}
	}
};
self.onmessage=function(e){
	if(e.data[0][0]==="com.communistjs"){
		return regMsg(e);
	}else{
		_fire(e.data[0][0],e.data[1]);
	}
};
var regMsg = function(e){
	var cb=function(data,transfer){
		!self._noTransferable?self.postMessage([e.data[0],data],transfer):self.postMessage([e.data[0],data]);
	};
	var result = _db[e.data[1]](e.data[2],cb);
	if(typeof result !== "undefined"){
		cb(result);
	}
};
_db.initialize();