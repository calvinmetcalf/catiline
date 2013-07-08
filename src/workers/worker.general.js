var _db = {};
_db.__close__ = function () {
	self.close();
};
var _self = {};
_db.__fun__ = $$fun$$;
_self.cb = function (data, transfer) {
	!self._noTransferable ? self.postMessage(data, transfer) : self.postMessage(data);
};
self.onmessage = function (e) {
	_self.result = _db.__fun__(e.data, _self.cb);
	if (typeof _self.result !== "undefined") {
		_self.cb(_self.result);
	}
}