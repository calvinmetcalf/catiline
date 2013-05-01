//this is mainly so the name shows up when you look at the object in the console
var Communist = function(){};
//regex out the importScript call and move it up to the top out of the function.
function moveImports(string){
	var script;
	var match = string.match(/(importScripts\(.*\);)/);
	if(match){
		script = match[0].replace(/importScripts\((.*)\);?/,function(a,b){if(b){return "importScripts("+b.split(",").map(function(cc){return '"'+c.makeUrl(cc.slice(1,-1))+'"'})+");\n";}else{return "";}})+string.replace(/(importScripts\(.*\);?)/,"\n");
	}else{
		script = string;
	}
	return script;
}

function getPath(){
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
//special case of worker only being called once, instead of sending the data
//we can bake the data into the worker when we make it.