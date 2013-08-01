//regex out the importScript call and move it up to the top out of the function.
function regexImports(string){
	var rest=string,
	match = true,
	matches = {},
	loopFunc = function(a,b){
		if(b){
			"importScripts("+b.split(",").forEach(function(cc){
				matches[communist.makeUrl(cc.match(/\s*[\'\"](\S*)[\'\"]\s*/)[1])]=true; // trim whitespace, add to matches
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
function moveIimports(string){
	var str = regexImports(string);
	var matches = str[0];
	var rest = str[1];
	if(matches.length>0){
		return 'importScripts("'+matches.join('","')+'");eval(__scripts__);\n'+rest;
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
function actualMakeI(script,codeword){
	var promise = communist.deferred();
	var iFrame = document.createElement('iframe');
		iFrame.style.display = 'none';
		document.body.appendChild(iFrame);
	var iScript = document.createElement('script');
	iScript.text='try{ '+
	'var __scripts__="";function importScripts(scripts){	if(Array.isArray(scripts)&&scripts.length>0){		scripts.forEach(function(url){			var ajax = new XMLHttpRequest();			ajax.open("GET",url,false);ajax.send();__scripts__+=ajax.responseText;__scripts__+="\\n;";});}};'+script+
	'}catch(e){window.parent.postMessage(["'+codeword+'","error"],"*")}';
	if(iFrame.contentDocument.readyState==="complete"){
		iFrame.contentDocument.body.appendChild(iScript);
		promise.resolve(iFrame);
	}else{
		iFrame.contentWindow.addEventListener('load',function(){
			iFrame.contentDocument.body.appendChild(iScript);
			promise.resolve(iFrame);
		});
	}
	return promise.promise;
}
function makeIframe(script,codeword){
	var promise = communist.deferred();
	if(document.readyState==="complete"){
		actualMakeI(script,codeword).then(function(a){promise.resolve(a);});
	}else{
		window.addEventListener('load',function(){
			actualMakeI(script,codeword).then(function(a){promise.resolve(a);});
		},false);
	}
	return promise.promise;
}
communist.makeIWorker = function (strings,codeword){
	var script =moveIimports(strings.join(""));
	var worker = {onmessage:function(){}};
	var ipromise = makeIframe(script,codeword);
	window.addEventListener('message',function(e){
		if(Array.isArray(e.data)&&e.data[0]===codeword){
			e.data.shift();
			worker.onmessage(e);
		}
	});
	worker.postMessage=function(data){
		ipromise.then(function(iFrame){
			iFrame.contentWindow.postMessage(data,"*");
		});
	};
	worker.terminate=function(){
		ipromise.then(function(iFrame){
			document.body.removeChild(iFrame);
		});
	};
	return worker;
	
};
//accepts an array of strings, joins them, and turns them into a worker.
communist.makeWorker = function (strings){
	var worker;
	var script =moveImports(strings.join(""));
	communist.URL = communist.URL||window.URL || window.webkitURL;
	try{
		worker= new Worker(communist.URL.createObjectURL(new Blob([script],{type: "text/javascript"})));
	}catch(e){
		communist._noTransferable=true;
		worker = new Worker(getPath());
		worker.postMessage(script);
	}finally{
		return worker;
	}
};

communist.makeUrl = function (fileName) {
	var link = document.createElement("link");
	link.href = fileName;
	return link.href;
};