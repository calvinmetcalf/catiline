Changelog
===

##1.7.0

- PUB/SUB! function inside the worker now have access to `this.fire`, `this,on`, and `this.off` functions and there are equivilent `cw.fire`, `cw.on`, and `cw.off` functions on cw objects.
- improvements to the legacy tests such that a nonlegacy browser can pass them.
- `communist.noConflict` now accepts a string if you want to change the name to something else.
- cleaned up some of the files that didn't need to be there.