function (dat, cb) {
	var fun = $$fun$$;
	switch (dat[0]) {
	case "data":
		if (!this._r) {
			this._r = dat[1];
		}
		else {
			this._r = fun(this._r, dat[1]);
		}
		break;
	case "get":
		return cb(this._r);
	case "close":
		cb(this._r);
		this.__close__();
		break;
	}
};