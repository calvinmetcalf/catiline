Changelog
===

##2.1.0

- Moved `cw.makeUrl()` to util.js, not sure why it was in wrapup.js.
- Passing a falsy value or a number less then 2 as the number of workers in a queue
now just returns a regular (non-queue) worker
- multiple events can now be fired at once by passing a space sperated list of event
names to `.fire()`

##2.0.0

- Ajax and map reduce are now seprate plugins
- fake workers and workers now all use the same test script
- more consistency with error handling in fakeWorkers
- `cw(function,data)` is removed in favor of `cw.single(function,data)`
- `cw.communist `->`cw.worker`
- more verbose variable names
- events now take a scope as a second argument and direct functions take it as a third
- `console.log` is available inside a worker
- cw.single is now it's own plugin, tests updated acordingly.


##1.7.4

- run the legacy browser test (though not in a legacy browser) locally
- fixes related to reducer.

##1.7.3

- multiuse is no longer a separate function but just what happens when the object worker is called with a function
- all is now part of promiscious
- since we only have one worker type we can simplify the build script
- tighter jshint options
- having a space in the `importScripts()` will no longer cause an infinite loop thanks to [shole](https://github.com/shole)

##1.7.2

- patch from [Fresheyeball](https://github.com/Fresheyeball) to get it working 
on more commonjs enviroments
- all the worker creation functions now have publicly accessable methods
- `communist.worker` is now accessable at `communist.makeWorker` with `communist.worker` going to be reasasined in 2.0.0
- the internals are now massivly simplified.
- bump the version of firefox we test to 22
- remove opera from the tests until I can figure out why I can't even do a manual test on Opera in sauce labs.
- remove src/workers folder as we now only have 1 seperate worker script.
- fix type with events in batchTransfer queues.
- Had to put up a monkey patch onto communist.ajax as I accidentally broke it, seriously It's going to be gone soon stop using it.

##1.7.1

- Improvements to pub-sub when using a worker queue
- The `communist.ajax` method is being depreciated it's still around for now but 
I took out the tests and docs, all the breaking changes are being saved up.
- `importScripts` behaves much more like you expect it, importing the same script
multiple times only gets downloaded once and all `importScripts` calls you make
are counted.
- Fake workers (aka in IE9) can now import scripts
- you can use a global flag of `fakeLegacy` to force a browser that suppports workers to pretend it dosn't.

##1.7.0

- PUB/SUB! function inside the worker now have access to `this.fire`, `this,on`, and `this.off` functions and there are equivilent `cw.fire`, `cw.on`, and `cw.off` functions on cw objects.
- improvements to the legacy tests such that a non-legacy browser can pass them.
- `communist.noConflict` now accepts a string if you want to change the name to something else.
- cleaned up some of the files that didn't need to be there.
- created this changelog
- tidied up the repo
