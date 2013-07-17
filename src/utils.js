//this is mainly so the name shows up when you look at the object in the console
var Communist = function(){};
//regex out the importScript call and move it up to the top out of the function.
function regexImports(string){
	var rest=string,
	match = true,
	matches = {},
	loopFunc = function(a,b){
		if(b){
			"importScripts("+b.split(",").forEach(function(cc){
				matches[c.makeUrl(cc.match(/\s*[\'\"](\S*)[\'\"]\s*/)[1])]=true; // trim whitespace, add to matches
			})+");\n";
		}
	};
	while(match){
		match = rest.match(/(importScripts\(.*?\);?)/);
		rest = rest.replace(/(importScripts\(\s*(?:[\'\"].*?[\'\"])?\s*\);?)/,"\n");
		if(match){
			match[0].replace(/importScripts\(\s*([\'\"].*?[\'\"])?\s*\);?/g,loopFunc);
		}
	}
	matches = Object.keys(matches);
	return [matches,rest];
}

function moveImports(string){
	var str = regexImports(string);
	var matches = str[0];
	var rest = str[1];
	if(matches.length>0){
		return 'importScripts("'+matches.join('","')+'");\n'+rest;
	}else{
		return rest;
	}
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