function c(a,b,d){
	if(typeof a !== "number" && typeof b === "function"){
		return c.mapper(a,b,d);
	}else if(typeof a === "object" && !Array.isArray(a)){
		if(typeof b === "number"){
			return c.queue(a,b,d);
		}else{
			return c.communist(a);
		}
	}else if(typeof a !== "number"){
		return b ? c.singleUse(a,b):c.communist(a);
	}else if(typeof a === "number"){
		return c.mapReduce(a,b);
	}
}
c.reducer = rWorker;
c.mapper = mapWorker;
c.worker = makeWorker;
c.makeWorker = makeWorker;
c.makeUrl = function (fileName) {
	var link = document.createElement("link");
	link.href = fileName;
	return link.href;
};
c.singleUse = single;
c.communist = function(input){
	if(typeof input === 'function'){
		return object({data:input});
	}else{
		return object(input);
	}
};
c.mapReduce=function(num,nonIncremental){
	if(nonIncremental){
		return nonIncrementalMapReduce(num);
	}else{
		return incrementalMapReduce(num);
	}
};
c.queue = queue;
c.ajax = function(url,after,notjson){
	var obj={ajax:function (url, _cb) {
		var that = this;
		var request = new XMLHttpRequest();
		request.open("GET", url);
			request.onreadystatechange = function() {
				var _resp;
				if (request.readyState === 4 && request.status === 200) {
					_resp = that.after(!that.notjson?JSON.parse(request.responseText):request.responseText);
					if(typeof _resp!=="undefined"){
						_cb(_resp);
						}
					}
			};
			request.onerror=function(e){
				throw(e);
			};
		request.send();
	}};
	obj.after = after||function(a){return a;};
	obj.notjson = notjson||false;
	return c(obj).ajax(c.makeUrl(url));
};
function initBrowser(c){
	var origCW = global.cw;
	c.noConflict=function(newName){
		global.cw = origCW;
		if(newName){
			global[newName]=c;
		}
	};
	global.communist = c;
	global.cw = c;
	
}
if(typeof module === "undefined" || !('exports' in module)){
	initBrowser(c);
} else {
	module.exports=c;
}
