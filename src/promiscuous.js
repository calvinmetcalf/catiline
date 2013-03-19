/*! Promiscuous ©2013 Ruben Verborgh @license MIT https://github.com/RubenVerborgh/promiscuous*/
(function (exports) {
  var func = "function",
      noop = function () {};

  function createDeferred() {
    var handler,
        changeState,
        promise = {
          then: function (onFulfilled, onRejected) {
            return handler(onFulfilled, onRejected);
          }
        };

    (function () {
      var pending = [];
      handler = function (onFulfilled, onRejected) {
        var d = createDeferred();
        pending.push({ d: d, resolve: onFulfilled, reject: onRejected });
        return d.promise;
      };
      changeState = function (action, value, success) {
        for (var i = 0, l = pending.length; i < l; i++) {
          var p = pending[i], deferred = p.d, callback = p[action];
          if (typeof callback !== func)
            deferred[action](value);
          else
            execute(callback, value, deferred);
        }
        handler = createHandler(promise, value, success);
        changeState = noop;
      };
    })();

    return {
      resolve: function (value)  { changeState('resolve', value, true); },
      reject : function (reason) { changeState('reject', reason, false); },
      promise: promise
    };
  }

  function createHandler(promise, value, success) {
    return function (onFulfilled, onRejected) {
      var callback = success ? onFulfilled : onRejected, result;
      if (typeof callback !== func)
        return promise;
      setTimeout(execute.bind(promise, callback, value, result = createDeferred()));
      return result.promise;
    };
  }

  function execute(callback, value, deferred) {
    try {
      var result = callback(value);
      if (result && typeof result.then === func)
        result.then(deferred.resolve, deferred.reject);
      else
        deferred.resolve(result);
    }
    catch (error) {
      deferred.reject(error);
    }
  }

  exports.resolve= function (value) {
      var promise = {};
      promise.then = createHandler(promise, value, true);
      return promise;
    };
    exports.reject= function (reason) {
      var promise = {};
      promise.then = createHandler(promise, reason, false);
      return promise;
    }
    exports.deferred=createDeferred;
})(c);