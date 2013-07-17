function rWorker(fun, callback) {
	var obj = {
		fun: fun,
		data: function (dat) {
			if (!this._r) {
				this._r = dat;
			}
			else {
				this._r = this.fun(this._r, dat);
			}
		},
		fetch: function () {
			this.fire('msg',this._r);
		},
		close: function (silent) {
			if (!silent) {
				this.fire('msg',this._r);
			}
			self.terminate;
		}
	};
	var worker = object(obj);
	worker.on('msg', callback);
	return worker;
}