"use strict";
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
		func.call(scope, a, _db);
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
var console={};
function makeConsole(method){
	return function(){
		var len = arguments.length;
		var out =[];
		var i = 0;
		while (i<len){
			out.push(arguments[i]);
			i++;
		}
		_db.fire("console",[method,out]);
	};
}
["log", "debug", "error", "info", "warn", "time", "timeEnd"].forEach(function(v){
	console[v]=makeConsole(v);
});
self.onmessage=function(e){
	_fire("messege",e.data[1]);
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
	var result = _db[e.data[1]](e.data[2],cb,_db);
	if(typeof result !== "undefined"){
		cb(result);
	}
};
_db.initialize();
