function c(a,b,d){
	if(typeof a !== "number" && typeof b === "function"){
		return mapWorker(a,b,d);
	}else if(typeof a === "object" && !Array.isArray(a)){
		if(typeof b === "number"){
			return queue(a,b,d);
		}else{
			return object(a);
		}
	}else if(typeof a !== "number"){
		return b ? single(a,b):multiUse(a);
	}else if(typeof a === "number"){
		return !b ? incrementalMapReduce(a):nonIncrementalMapReduce(a);
	}
}
c.reducer = rWorker;
c.worker = makeWorker;
c.makeUrl = function (fileName) {
	var link = document.createElement("link");
	link.href = fileName;
	return link.href;
};
c.ajax = function(url,after,notjson){
	var txt=!notjson?'JSON.parse(request.responseText)':"request.responseText";
	var resp = after?"("+after.toString()+")("+txt+",_cb)":txt;
	var func = 'function (url, _cb) {\n\
		var request = new XMLHttpRequest();\n\
		request.open("GET", url);\n\
			request.onreadystatechange = function() {\n\
				var _resp;\n\
				if (request.readyState === 4 && request.status === 200) {\n'+
					'_resp = '+resp+';\n\
					if(typeof _resp!=="undefined"){_cb(_resp);}\n\
					}\n\
			};\n\
			request.onerror=function(e){throw(e);}\n\
		request.send();\n\
	}';
	return c(func,c.makeUrl(url));
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
if(typeof module === "undefined" || typeof module.exports === "undefined" ){
	initBrowser(c);
} else {
	module.exports=c;
}
