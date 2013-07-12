//this is mainly so the name shows up when you look at the object in the console
var Communist = function(){};
//regex out the importScript call and move it up to the top out of the function.
function moveImports(string){
	var script,
	newScript,
	rest=string,
	match = true;
	while(match){
		match = rest.match(/(importScripts\(.*?\);)/);
		rest = rest.replace(/(importScripts\(.*?\.js[\'\"]\);?)/,"\n");
		if(match){
			newScript = match[0].replace(/importScripts\((.*?\.js[\'\"])\);?/,
			function(a,b){
				if(b){
					return "importScripts("+b.split(",").map(function(cc){
						return cc.slice(0,1)+c.makeUrl(cc.slice(1,-1))+cc.slice(-1);
					})+");\n";
				} else {
					return "";
				}
			});
			if(script){
				script += newScript;
			}else{
				script = newScript;
			}
		}else{
			if(script){
				script = script + rest;
			}
		}
	}
	return script?script:rest;
}

function getPath(){
	if(typeof SHIM_WORKER_PATH !== "undefined"){
		return SHIM_WORKER_PATH;
	}
	var scripts = document.getElementsByTagName("script");
		var len = scripts.length;
		var i = 0;
		while(i<len){
			if(/communist(\.min)?\.js/.test(scripts[i].src)){
				return scripts[i].src;
			}
			i++;
		}
}
//accepts an array of strings, joins them, and turns them into a worker.
function makeWorker(strings){
	var worker;
	var script =moveImports(strings.join(""));
	c.URL = c.URL||window.URL || window.webkitURL;
	try{
		worker= new Worker(c.URL.createObjectURL(new Blob([script],{type: "text/javascript"})));
	}catch(e){
		c._noTransferable=true;
		worker = new Worker(getPath());
		worker.postMessage(script);
	}finally{
		return worker;
	}
}