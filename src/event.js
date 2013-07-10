var parent = {};
var listeners = {};
parent.on=function(eventName,func,scope){
	if(!(eventName in listeners)){
		listeners[eventName]=[];
	}
	listeners[eventName].push(function(a){
		func.call(scope,a);
	});
};
parent.fire=function(eventName,data){
	if(!(eventName in listeners)){
		return;
	}
	listeners[eventName].forEach(function(v){
		v(data);
	});
}
parent.off=function(eventName,func){
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
}