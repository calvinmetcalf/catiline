var _self = {};
_self.fun = $$fun$$;
_self.cb = function (data, transfer) {
	!self._noTransferable ? self.postMessage(data, transfer) : self.postMessage(data);
	self.close();
};
_self.result = _self.fun(',JSON.stringify(data),', _self.cb);
if (typeof _self.result !== "undefined") {
	_self.cb(_self.result);
}