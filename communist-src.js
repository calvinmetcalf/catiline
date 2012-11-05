function communist(path){
	var _this = this;
	_this.path = path || getPath(document.location.href);
	var cbs={};
	window.URL = window.URL || window.webkiURL;
	var blob = new Blob(["exports={};exports._addLib=function(url){importScripts(url);return 'Success';};self.onmessage = function(event) {	var name =event.data[0];	var p = event.data[1];	var func = exports[event.data[0]];	var cb = event.data[2]  self.postMessage([cb,func(p)]);};"]);
	var w = window.URL.createObjectURL(blob);
	_this.worker = new Worker(w);
	_this.worker.onmessage = function(event){
	var cb = cbs[event.data[0]];
	var data = event.data[1];
	cb(data);
	delete cbs[event.data[0]];
	}
	_this.send = function(func,data,cb){
	var r = Math.random()+"";
	cbs[r]=cb;
		_this.worker.postMessage([func,data,r]);
	}
	_this.addLib=function(url){
		_this.send("_addLib",_this.path+url,function(d){console.log(d)});
	}
	getPath(url){
		var index = url.indexOf('index.html');
		var ourl;
    	if (index != -1) {
      		ourl = url.substring(0, index);
    	}else{ourl=url};
    	return ourl;
	}
};

