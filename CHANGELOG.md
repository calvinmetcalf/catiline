Changelog
===

##1.7.1

- Improvements to pub-sub when using a worker queue
- The `communist.ajax` method is being depreciated it's still around for now but I took out the tests and docs, all the breaking changes are being saved up.
- using `importScripts` inside your worker scripts is now easier as each script can individually call the function and any given script is only imported once. In other words copy and paste your functions without worry.

##1.7.0

- PUB/SUB! function inside the worker now have access to `this.fire`, `this,on`, and `this.off` functions and there are equivilent `cw.fire`, `cw.on`, and `cw.off` functions on cw objects.
- improvements to the legacy tests such that a non-legacy browser can pass them.
- `communist.noConflict` now accepts a string if you want to change the name to something else.
- cleaned up some of the files that didn't need to be there.
- created this changelog
- tidied up the repo