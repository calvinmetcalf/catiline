
var _db = $$fObj$$;
var __self__={onmessage:function(){}};
window.onmessage=function(e){
	if(typeof e.data === "string"){
		e ={data: JSON.parse(e.data)};
	}
	__self__.onmessage(e);
};
__self__.postMessage=function(rawData){
	var data = _db.__codeWord__+JSON.stringify(rawData);
	window.parent.postMessage(data,"*");
};
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
function _fire(eventName,data){
	if(eventName.indexOf(" ")>0){
		eventName.split(" ").forEach(function(v){
			_fire(v,data);
		});
		return;
	}
	if (!(eventName in listeners)) {
		return;
	}
	listeners[eventName].forEach(function (v) {
		v(data);
	});
}

_db.fire = function (eventName, data, transfer) {
	__self__.postMessage([
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
if(window.parent.console){
	console = window.parent.console;
}
__self__.onmessage=function(e){
	_fire("messege",e.data[1]);
	if(e.data[0][0]===_db.__codeWord__){
		return regMsg(e);
	}else{
		_fire(e.data[0][0],e.data[1]);
	}
};
var regMsg = function(e){
	var cb=function(data,transfer){
		__self__.postMessage([e.data[0],data]);
	};
	var result;
	try{
		result = _db[e.data[1]](e.data[2],cb,_db);
	}catch(e){
		_db.fire("error",JSON.stringify(e));
	}
	if(typeof result !== "undefined"){
		cb(result);
	}
};
_db.initialize(_db);
