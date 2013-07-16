function rWorker(fun,callback){
	if(typeof Worker === 'undefined'||typeof fakeLegacy !== 'undefined'){
		return fakeReducer(fun,callback);
	}
	var w = new Communist();
	var obj = {
		fun:fun,
		data:function(dat){
			if (!this._r) {
				this._r = dat;
			}
			else {
				this._r = this.fun(this._r, dat);
			}
		},
		fetch:function(){
			return this._r;
		},
		close:function(silent,cb){
			if(!silent){
				cb(this._r);
			}
			self.terminate;
		}
	};
	var worker = object(obj);
	worker.on('message',callback);
	return worker;
}