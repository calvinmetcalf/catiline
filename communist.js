function communist(){
	var _this = this;
	var cbs={};
	_this.worker = new Worker('worker.js');
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
		_this.send("_addLib",url,function(d){console.log(d)});
	}
};

