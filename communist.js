(function() {
  var Communist, Socialist,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  Communist = (function() {

    function Communist(fun) {
      this.send = __bind(this.send, this);

      var bUrl, blob, body;
      window.URL = window.URL || window.webkiURL;
      body = "var send;var _f =  " + fun + ";self.addEventListener('message', function(_e) {send = function(data){self.postMessage({messege:data,cb:_e.data.cb})};try{self.postMessage({body:_f.apply(null, _e.data.body),cb:_e.data.cb})}catch(_err){self.postMessege({error:_err,cb:_e.data.cb})}})";
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
        } else if (e.data.messege) {
          _this.CBs[e.data.cb](null, e.data.messege);
        } else if (e.data.error) {
          CBs[e.data.cb](e.data.error);
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
      try {
        cb(null, this._func.apply(self, data));
        return true;
      } catch (err) {
        cb(err);
        return false;
      }
      return true;
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
      return new Communist(fun.toString());
    } else {
      return new Socialist(fun);
    }
  };

}).call(this);
