(function() {
  var Communist, Socialist,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  Communist = (function() {

    function Communist(fun) {
      this.start = __bind(this.start, this);

      this.send = __bind(this.send, this);

      var bUrl, blob, body;
      window.URL = window.URL || window.webkiURL;
      if (fun) {
        fun = fun.toString();
        body = "var send;var _f =  " + fun + ";self.addEventListener('message', function(_e) {send = function(data){self.postMessage({message:data,cb:_e.data.cb})};self.postMessage({body:_f.apply(null, _e.data.body),cb:_e.data.cb})})";
      } else {
        body = "var _db = {}\n				_db._add=function(name, func){\n				_db[name]=eval(\"(\"+func+\")\");\n					return true;	\n				};	\n				_db._rm=function(name){\n					delete _db[name];		\n					return true;\n				};\n				_db._test=function(a){\n					return a || \"all quiet\";\n				};\n				var _f =  function () {\n				    var args, method,__slice = [].slice;\n				    method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n				    return _db[method].apply(null, args);\n				  };\n				 self.addEventListener('message', function(_e) {\n				 	self.send = function(data){\n				 		self.postMessage({\n						messege:data,cb:_e.data.cb\n					});\n				};\n					self.postMessage({\n					cb:_e.data.cb,\n					body:_f.apply(null, _e.data.body)\n					});\n\n				});";
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
        } else if (e.data.message) {
          _this.CBs[e.data.cb](null, e.data.message);
        }
        return true;
      };
      this._worker.onerror = function(e) {
        cb(e);
        return true;
      };
      return true;
    };

    Communist.prototype.start = function(cb) {
      return this.send(cb);
    };

    Communist.prototype.close = function() {
      this._worker.terminate();
      return true;
    };

    Communist.prototype.add = function(method, func, cb) {
      if (cb == null) {
        cb = function() {
          return true;
        };
      }
      return this.send("_add", method, func.toString(), cb);
    };

    Communist.prototype.remove = function(method, cb) {
      if (cb == null) {
        cb = function() {
          return true;
        };
      }
      return this.send("_rm", method, cb);
    };

    true;

    return Communist;

  })();

  window.Communist = Communist;

  Socialist = (function() {

    function Socialist(fun) {
      this.start = __bind(this.start, this);

      this.send = __bind(this.send, this);

      var _this = this;
      if (fun) {
        this._func = fun;
      } else {
        this._db = {};
        this._db._add = function(name, func) {
          _this._db[name] = func;
          return true;
        };
        this._db._rm = function(name) {
          delete _this._db[name];
          return true;
        };
        this._func = function() {
          var args, name;
          name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          return this._db[name].apply(null, args);
        };
      }
    }

    Socialist.prototype.CBs = {};

    Socialist.prototype.send = function() {
      var cb, data, self, _i;
      data = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
      self = {};
      self.send = function(m) {
        return cb(null, m);
      };
      if (this._db) {
        self._db = this._db;
      }
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

    if (Socialist._db) {
      Socialist.prototype.add = function(method, func, cb) {
        if (cb == null) {
          cb = function() {
            return true;
          };
        }
        return this.send("_add", method, func, cb);
      };
      Socialist.prototype.remove = function(method, cb) {
        if (cb == null) {
          cb = function() {
            return true;
          };
        }
        return this.send("_rm", method, cb);
      };
    }

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
      if (fun) {
        return new Socialist(fun);
      } else {
        return new Socialist();
      }
    }
  };

}).call(this);
