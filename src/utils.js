catiline._hasWorker = typeof Worker !== 'undefined'&&typeof fakeLegacy === 'undefined';
catiline.URL = window.URL || window.webkitURL;
catiline._noTransferable=!catiline.URL;
//regex out the importScript call and move it up to the top out of the function.
function regexImports(string){
	let rest=string;
	let match = true;
	let matches = {};
	const loopFunc = function(a,b){
		if(b){
			'importScripts('+b.split(',').forEach(function(cc){
				matches[catiline.makeUrl(cc.match(/\s*[\'\"](\S*)[\'\"]\s*/)[1])]=true; // trim whitespace, add to matches
			})+');\n';
		}
	};
	while(match){
		match = rest.match(/(importScripts\(.*?\)[;|,]?)/);
		rest = rest.replace(/(importScripts\(\s*(?:[\'\"].*?[\'\"])?\s*\)[;|,]?)/,'\n');
		if(match){
			match[0].replace(/importScripts\(\s*([\'\"].*?[\'\"])?\s*\)[;|,]?/g,loopFunc);
		}
	}
	matches = Object.keys(matches);
	return [matches,rest];
}

function moveImports(string,after){
	const str = regexImports(string);
	const matches = str[0];
	const rest = str[1];
	if(matches.length>0){
		return 'importScripts(\''+matches.join('\',\'')+after+rest;
	}else{
		return rest;
	}
}
function getPath(){
	if(typeof SHIM_WORKER_PATH !== 'undefined'){
		return SHIM_WORKER_PATH;
	}else if('SHIM_WORKER_PATH' in catiline){
		return catiline.SHIM_WORKER_PATH;
	}
	var scripts = document.getElementsByTagName('script');
	const len = scripts.length;
	let i = 0;
	while(i<len){
		if(/catiline(\.min)?\.js/.test(scripts[i].src)){
			return scripts[i].src;
		}
		i++;
	}
}
function appendScript(iDoc,text){
	const iScript = iDoc.createElement('script');
	if (typeof iScript.text !== 'undefined') {
		iScript.text = text;
	} else {
		iScript.innerHTML = text;
	}
	if(iDoc.readyState==='complete'){
		iDoc.documentElement.appendChild(iScript);
	}else{
		iDoc.onreadystatechange=function(){
			if(iDoc.readyState==='complete'){
				iDoc.documentElement.appendChild(iScript);
			}
		};
	}
}
//much of the iframe stuff inspired by https://github.com/padolsey/operative
//most things besides the names have since been changed
function actualMakeI(script,codeword){
	const iFrame = document.createElement('iframe');
	iFrame.style.display = 'none';
	document.body.appendChild(iFrame);
	const iDoc = iFrame.contentWindow.document;
	const text=['try{ ',
	'var __scripts__=\'\';function importScripts(scripts){',
	'	if(Array.isArray(scripts)&&scripts.length>0){',
	'		scripts.forEach(function(url){',
	'			var ajax = new XMLHttpRequest();',
	'			ajax.open(\'GET\',url,false);',
	'			ajax.send();__scripts__+=ajax.responseText;',
	'			__scripts__+=\'\\n;\';',
	'		});',
	'	}',
	'};',
	script,
	'}catch(e){',
	'	window.parent.postMessage([\''+codeword+'\',\'error\'],\'*\')',
	'}'].join('\n');
	appendScript(iDoc,text);
	return iFrame;
}
function makeIframe(script,codeword){
	const promise = catiline.deferred();
	if(document.readyState==='complete'){
		promise.resolve(actualMakeI(script,codeword));
	}else{
		window.addEventListener('load',function(){
			promise.resolve(actualMakeI(script,codeword));
		},false);
	}
	return promise.promise;
}
catiline.makeIWorker = function (strings,codeword){
	const script =moveImports(strings.join(''),'\');eval(__scripts__);\n');
	const worker = {onmessage:function(){}};
	const ipromise = makeIframe(script,codeword);
	window.addEventListener('message',function(e){
		if(e.data.slice && e.data.slice(0,codeword.length) === codeword){
			worker.onmessage({data:JSON.parse(e.data.slice(codeword.length))});
		}
	});
	worker.postMessage=function(data){
		ipromise.then(function(iFrame){
			iFrame.contentWindow.postMessage(JSON.stringify(data),'*');
		});
	};
	worker.terminate=function(){
		ipromise.then(function(iFrame){
			document.body.removeChild(iFrame);
		});
	};
	return worker;
	
};

function makeFallbackWorker(script){
	catiline._noTransferable=true;
	const worker = new Worker(getPath());
	worker.postMessage(script);
	return worker;
}
//accepts an array of strings, joins them, and turns them into a worker.
catiline.makeWorker = function (strings, codeword){
	if(!catiline._hasWorker){
		return catiline.makeIWorker(strings,codeword);
	}
	let worker;
	const script = moveImports(strings.join('\n'),'\');\n');
	if(catiline._noTransferable){
		return makeFallbackWorker(script);
	}
	try{
		worker= new Worker(catiline.URL.createObjectURL(new Blob([script],{type: 'text/javascript'})));
	}catch(e){
		try{
			worker=makeFallbackWorker(script);
		}catch(ee){
			worker = catiline.makeIWorker(strings,codeword);
		}
	}finally{
		return worker;
	}
};

catiline.makeUrl = function (fileName) {
	const link = document.createElement('link');
	link.href = fileName;
	return link.href;
};

function stringifyObject(obj){
	let out = '{';
	let first = true;
	for(let key in obj){
		if(first){
			first = false;
		}else{
			out+=',';
		}
		out += key;
		out += ':';
		out += catiline.stringify(obj[key]);
	}
	out += '}';
	return out;
}
function stringifyArray(array){
	if(array.length){
		let out = '[';
		out += catiline.stringify(array[0]);
		let i = 0;
		const len = array.length;
		while(++i<len){
			out += ',';
			out += catiline.stringify(array[i]);
		}
		out += ']';
		return out;
	}else{
		return '[]';
	}
}
catiline.stringify = function(thing){
	if(Array.isArray(thing)){
		return stringifyArray(thing);
	}else if(typeof thing === 'function'||typeof thing === 'number'||typeof thing === 'boolean'){
		return thing.toString();
	}else if(typeof thing === 'string'){
		return '"' + thing + '"';
	}else if(thing.toString() === '[object Object]'){
		return stringifyObject(thing);
	}
};
