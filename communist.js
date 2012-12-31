(function() {
  var Communist, Socialist, defaultFunc,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  defaultFunc = "var _db = {}\n_db._add=function(name, func){\n	_db[name]=eval(\"(\"+func+\")\");\n	return true;	\n};	\n_db._rm=function(name){\n	delete _db[name];		\n	return true;\n};\n_db._test=function(a){\n	return a || \"all quiet\";\n};\nvar _f =  function () {\n    var args, method,__slice = [].slice;\n    method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n    return _db[method].apply(null, args);\n  };\n self.addEventListener('message', function(_e) {\n 	self.send = function(data){\n 		self.postMessage({\n 			messege:data,cb:_e.data.cb\n 		});\n 	};\n	self.postMessage({\n 		cb:_e.data.cb,\n 		body:_f.apply(null, _e.data.body)\n 		});\n 	\n});";

  Communist = (function() {

    function Communist(fun) {
      this.send = __bind(this.send, this);

      var bUrl, blob, body;
      window.URL = window.URL || window.webkiURL;
      if (fun) {
        fun = fun.toString();
        body = "self._add=function(name, func){		_db[name]=eval('('+atob(func)+')');		return true;	};	self._rm=function(name){		delete _db[name];		return true;	};var _f =  " + fun + ";self.addEventListener('message', function(_e) {self.send = function(data){self.postMessage({messege:data,cb:_e.data.cb})};try{self.postMessage({body:_f.apply(null, _e.data.body),cb:_e.data.cb})}catch(_err){self.postMessage({error:_err,cb:_e.data.cb})}})";
      } else {
        body = defaultFunc;
      }
      blob = new Blob([body], {
        type: "text/javascript"
      });
      bUrl = window.URL.createObjectURL(blob);
      this._worker = new Worker(bUrl);
      this;

    }

    Communist.prototype.CBs = {};

    Communist.prototype.send = function() {
      var cb, data, id, _i,
        _this = this;
      data = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
      if (cb == null) {
        cb = function() {
          return true;
        };
      }
      id = ("" + Math.random()).slice(2);
      this.CBs[id] = cb;
      this._worker.postMessage({
        body: data,
        cb: id
      });
      this._worker.onmessage = function(e) {
        if (e.data.body) {
          _this.CBs[e.data.cb](null, e.data.body);
          delete _this.CBs[e.data.cb];
        } else if (e.data.error) {
          _this.CBs[e.data.cb](e.data.error);
          delete _this.CBs[e.data.cb];
        }
        return true;
      };
      this._worker.onerror = function(e) {
        cb(e);
        return true;
      };
      return true;
    };

    Communist.prototype.add = function(method, func, cb) {
      if (cb == null) {
        cb = function() {
          return true;
        };
      }
      this.send("_add", method, func.toString(), cb);
      return true;
    };

    Communist.prototype.remove = function(method, cb) {
      if (cb == null) {
        cb = function() {
          return true;
        };
      }
      this.send("_rm", method, cb);
      return true;
    };

    Communist.prototype.close = function() {
      this._worker.terminate();
      return true;
    };

    true;

    return Communist;

  })();

  window.Communist = Communist;

  Socialist = (function() {

    function Socialist(_func) {
      this._func = _func;
      this.start = __bind(this.start, this);

      this.send = __bind(this.send, this);

    }

    Socialist.prototype.CBs = {};

    Socialist.prototype.send = function() {
      var cb, data, self, _i;
      data = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
      self = {};
      self.send = function(m) {
        return cb(null, m);
      };
      self.setInterval = function() {
        var nDelay, vCallback, _args, _func,
          _this = this;
        vCallback = arguments[0], nDelay = arguments[1], _args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        _func = function() {
          return vCallback.apply(_this, _args);
        };
        return window.setInterval(_func, nDelay);
      };
      self.setTimeout = function() {
        var nDelay, vCallback, _args, _func,
          _this = this;
        vCallback = arguments[0], nDelay = arguments[1], _args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        _func = function() {
          return vCallback.apply(_this, _args);
        };
        return window.setInterval(_func, nDelay);
      };
      try {
        cb(null, this._func.apply(self, data));
        return true;
      } catch (err) {
        cb(err);
        return false;
      }
      return true;
    };

    Socialist.prototype.start = function(cb) {
      return this.send(cb);
    };

    Socialist.prototype.close = function() {
      var _func;
      _func = void 0;
      return true;
    };

    true;

    return Socialist;

  })();

  window.Socialist = Socialist;

  window.communist = function(fun) {
    if (window.Worker) {
      if (fun) {
        return new Communist(fun);
      } else {
        return new Communist();
      }
    } else {
      return new Socialist(fun);
    }
  };

}).call(this);
