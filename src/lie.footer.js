return module.exports;
})();
catiline.setImmediate = catiline.deferred.immediate;
catiline.all = catiline.deferred.all;
catiline.resolve = catiline.deferred.resolve;
catiline.rejected = catiline.deferred.reject;