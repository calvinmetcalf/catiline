Changelog
===

##1.7.1

- Improvements to pub-sub when using a worker queue
- The `communist.ajax` method is being depreciated it's still around for now but 
I took out the tests and docs, all the breaking changes are being saved up.
- `importScripts` behaves much more like you expect it, importing the same script
multiple times only gets downloaded once and all `importScripts` calls you make
are counted.
- Fake workers (aka in IE9) no longer throw an error if you import a script.

##1.7.0

- PUB/SUB! function inside the worker now have access to `this.fire`, `this,on`, and `this.off` functions and there are equivilent `cw.fire`, `cw.on`, and `cw.off` functions on cw objects.
- improvements to the legacy tests such that a non-legacy browser can pass them.
- `communist.noConflict` now accepts a string if you want to change the name to something else.
- cleaned up some of the files that didn't need to be there.
- created this changelog
- tidied up the repo