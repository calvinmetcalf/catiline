const workerSetup = function(context) {
	self.__iFrame__ = typeof document !== 'undefined';
	self.__self__ = {
		onmessage: function(e) {
			context.trigger('messege', e.data[1]);
			if (e.data[0][0] === context.__codeWord__) {
				return regMsg(e);
			}
			else {
				context.trigger(e.data[0][0], e.data[1]);
			}
		}
	};
	if (__iFrame__) {
		window.onmessage = function(e) {
			if (typeof e.data === 'string') {
				e = {
					data: JSON.parse(e.data)
				};
			}
			__self__.onmessage(e);
		};
	}
	else {
		self.onmessage = __self__.onmessage;
	}
	__self__.postMessage = function(rawData, transfer) {
		if (!self._noTransferable && !__iFrame__) {
			self.postMessage(rawData, transfer);
		}
		else if (__iFrame__) {
			let data = context.__codeWord__ + JSON.stringify(rawData);
			window.parent.postMessage(data, '*');
		}
		else if (self._noTransferable) {
			self.postMessage(rawData);
		}
	};
	self.console = {};
	const regMsg = function(e) {
		const cb = function(data, transfer) {
			__self__.postMessage([e.data[0], data], transfer);
		};
		let result;
		if (__iFrame__) {
			try {
				result = context[e.data[1]](e.data[2], cb, context);
			}
			catch (ee) {
				context.fire('error', JSON.stringify(ee));
			}
		}
		else {
			result = context[e.data[1]](e.data[2], cb, context);
		}
		if (typeof result !== 'undefined') {
			cb(result);
		}
	};
};