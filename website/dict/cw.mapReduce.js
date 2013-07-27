(function(cw) {
	function rWorker(fun, callback) {
		var obj = {
			fun: fun,
			data: function(dat) {
				if (!this._r) {
					this._r = dat;
				}
				else {
					this._r = this.fun(this._r, dat);
				}
			},
			fetch: function() {
				this.fire('msg', this._r);
			},
			close: function(silent) {
				if (!silent) {
					this.fire('msg', this._r);
				}
				self.terminate;
			}
		};
		var worker = cw(obj);
		worker.on('msg', callback);
		return worker;
	}
	cw.mapReduce = function(threads) {
		var w = {};
		var len = 0;
		var promise;
		var workers = [];
		var data = [];
		var idle = threads;
		var reducer;
		var waiting = false;
		var closing = false;
		var status = {
			map: false,
			reduce: false,
			data: false
		};
		var checkStatus = function() {
			if (status.map && status.reduce && status.data) {
				return go();
			}
			else {
				return w;
			}
		};
		w.map = function(fun, t) {
			if (status.map) {
				return w;
			}
			var i = 0;

			function makeMapWorker() {
				var dd;

				function thenFunc(d) {
					if (typeof d !== undefined) {
						reducer.data(d);
					}
					if (len > 0) {
						len--;
						dd = data.pop();
						if (t) {
							mw2.data(dd, [dd]);
						}
						else {
							mw2.data(dd);
						}
					}
					else {
						idle++;
						if (idle === threads) {
							status.data = false;
							if (closing) {
								closeUp();
							}
							else if (waiting) {
								waiting = false;
								reducer.fetch();
							}
						}
					}
				}
				var mw1 = cw(fun);
				var mw2 = {
					data: function(data) {
						mw1.data(data).then(thenFunc);
					},
					close: function() {
						mw1.close();
					}
				};
				workers.push(mw2);
			}
			while (i < threads) {
				makeMapWorker();
				i++;
			}
			status.map = true;
			return checkStatus();
		};
		w.reduce = function(fun) {
			if (status.reduce) {
				return w;
			}
			reducer = rWorker(fun, function(d) {
				if (promise) {
					promise.resolve(d);
					promise = false;
				}
			});
			status.reduce = true;
			return checkStatus();
		};
		w.data = function(d) {
			if (closing) {
				return;
			}
			len = len + d.length;
			data = data.concat(d);
			status.data = true;
			return checkStatus();
		};

		function go() {
			var i = 0;
			var wlen = workers.length;
			while (i < wlen && len > 0 && idle > 0) {
				len--;
				workers[i].data(data.pop());
				i++;
				idle--;
			}
			return w;
		}
		w.fetch = function(now) {
			if (!promise) {
				promise = cw.deferred();
			}
			if (idle < threads && !now) {
				waiting = true;
			}
			else {
				reducer.fetch();
			}
			return promise.promise;
		};
		w.close = function() {
			if (!promise) {
				promise = cw.deferred();
			}
			if (idle < threads) {
				closing = true;
			}
			else {
				closeUp();
			}
			return promise.promise;
		};

		function closeUp() {
			reducer.close();
			workers.forEach(function(v) {
				v.close();
			});
		}
		return w;
	};
})(cw);