Communist
==========
![communist](http://communistjs.com/logo.png)


A JavaScrit library all about workers, want to use it? Grab the [development version](https://raw.github.com/calvinmetcalf/communist/master/dist/communist.js) or [production version](https://raw.github.com/calvinmetcalf/communist/master/dist/communist.min.js) from the dist folder. 

A few demos:

- [Parsing a dictionary](http://communistjs.com/website/dict/)
- [Fractal Map](http://communistjs.com/website/leaflet-fractal/)
- [RTree Bounding Boxes](http://leaflet-extras.github.io/RTree/examples/worker.html)
- [Census Visualization](http://data-otp.rhcloud.com/)
- [Vector Map Tiles](http://calvinmetcalf.github.io/vector-layers/)
- [Unzipping files and reprojecting maps](http://calvinmetcalf.github.io/shapefile-js/proj.html)


__Important:__ you're going to want to it yourself, on the same domain as your page, if you can't or need to bundle it see [hosting](#hosting).

API
===
```javascript
var worker = communist({sum:function(a,cb){cb(a[0]+a[1]);},square:function(a){return a*a;});
worker.sum([2,5]).then(function(a){console.log(a);})//prints 7
worker.square(5).then(function(a){console.log(a);})//prints 25
worker.close()//closes the worker, can be overwritten, worker._close() can't be.
```

Give it an object of functions, and you can call them by name, your functions can either return a value or call a callback function which is passed as the second argument.
Call the function with the data as the first argument and a transfer list for the second.
It takes two arguments, data and an optional list of any arrayBuffers to transfer ownership of.
If you want to do things once when the worker is created pass a function called `initialize` this gets called once with no arguments.  All workers are called in the same context so
`this` can be used to store things, functions can also use `this` to call each other. 

###Want it even simpler?

```javascript
var worker = communist(function(a,cb){cb(a[0]*a[1])});
worker.data([2,5]).then(function(a){console.log(a);})//prints 7
worker.close();//close it up
```

If you just pass a function then you can call it with data.   Data only takes the same 2 arguments as the callback data to transfer and the optional transfer list. These functions are always called with the same 2 arguments, data and callback.

###Even simpler?
```javascript
communist(function(a,cb){cb(a[0]*a[1])},[2,5]).then(function(a){console.log(a);})//prints 7
```

pass the data as the second argument and it crunches it returns the data and then closes up for you (don't use this if you are every doing more then one thing with workers).

###Experimental Queues

```javascript
var workers = communist({sum:function(a,cb){cb(a[0]+a[1])},square:function(a){return a*a;}},4);
```

Just add a number after the object (for a function just wrap it in `{data:YOUR FUNC}` and it's identical) and it will create that number or workers. Then calls will be divided among them, you can also call bulk methods works just like the regular method but also can call bulk methods which return arrays:


```javascript
workers.square(4).then(function(a){console.log(a);});//normal way prints 16;
workers.batch.square([1,2,3,4,5,6,7,8]).then(function(a){console.log(a);});//bulk prints [1,4,9,16,25,36,49,64]
```

if you give it a callback then it calls the callback for each of the bulk items instead of waiting for all to be done.

```javascript
var workers = communist({sum:function(a,cb){cb(a[0]+a[1])},square:function(a){return a*a;}},4);
workers.square(4).then(function(a){console.log(a);});//the same way prints 16;
workers.batch(function(a){console.log(a)}).square([1,2,3,4,5,6,7,8]);/*prints:
1
4
9
16
25
36
49
64
*/
```

If you want to dispence with the queueing system you can also do a dumb queue

```javascript
var workers = communist({sum:function(a,cb){cb(a[0]+a[1]);},square:function(a){return a*a;},4,'dumb');
```

which is exactly like the other queue but instead of carefully queueing and only giving data to workers that are ready, it sprays the workers with the data completly randomly until it's out of data, think very carefully before using
can lead to "three stooges syndrome" where all the results come back at exactly the same time and freeze the dom.

can use bulk and callback with it too but results may be different

```javascript
var workers = communist({sum:function(a,cb){cb(a[0]+a[1])},square:function(a){return a*a;}},4,'dumb');
workers.batch(function(a){console.log(a)}).square([1,2,3,4,5,6,7,8]);/* prints
1
25
16
4
36
9
49
64
*/
```

###Goodies: Map/Reduce

```javascript
var worker = communist(4);
//pass it the number of map workers
worker.data([1,2,3]);
//pass it data
worker.map(function(x){return x*x;});
//function do be done once on each datum
worker.reduce(function(a,b){return a+b;});
//reduce function
worker.data([4,5,6]);
worker.fetch().then(function(a){console.log(a)});
//prints 91
worker.data([6,7,8]).fetch().then(function(a){console.log(a)});
//prints 240
//fetch takes an argument "now", if it's undefined then waitins until it's done
worker.data([6,7,8]).fetch(true).then(function(a){console.log(a)});
//also prints 240
worker.close().then(function(a){console.log(a)});
//prints 389
```

the reducer function is also available for you if you want.

```javascript
var worker = communist.reducer(function, callback);
//give it data with
worker.data(3);
//send back data and call the callback
worker.fetch();
//close it
worker.close([silent]);
//it'll grab the data one more time and call the callback with it, unless you pass a parameter.

```

there is also a map function you can call if you want

```javascript
var worker = communist(function,callback,onerr);
//opens the worker with the function
worker.data(stuff);
//send it data any data that comes back callback is called on
//errs got to onerr if that is not specified callback is called with no data.
worker.close();
//close that
```

###Hosting<a id='hosting'></a>
If you need to host it on a seperate domain, or bundle it with other scripts and still want it to work on IE10, Opera, and Safari. You need to host the file "SHIM_WORKER.js" on the same domain as the html file 
and set the path to it in a globar variable `SHIM_WORKER_PATH` before you load this script.

###Misc

we have a few utility functions you can use

`communist.makeUrl(reletiveURL);` returns an absolute url and

`communist.worker([aray of strings]);` returns worker made from those strings.

```communist.ajax(url[,after,notjson]);``` returns promise, after is a function to call on the data after download in the worker, notjson should be true if you don't want to run JSON.parse on it.

`communist.deferred();` makes a new promise and returns it, used internally. Technically `communist` is a shortcut to [Promiscuous](https://github.com/RubenVerborgh/promiscuous/) which is used for promises, so any of promiscuouses methods can be used, aka call `communist.resolve(value)` for an already resolved promise and `communist.reject(reason)` for a rejected one. Lastly you can call `communist.all([promises])` on an array of promises, should work just like `Q.all()`.

`communist.setImmediate();` implements [setImmediate](https://github.com/NobleJS/setImmediate), at least the parts that apply to non web workers that can create web workers.

This grew out of my work with [earlier versions](https://github.com/calvinmetcalf/communist/tree/6e920be75ab3ed9b2a36d24dd184a9945f6b4000) of  this library and [Parallel.js](https://github.com/adambom/parallel.js).

[![Selenium Test Status](https://saucelabs.com/browser-matrix/calvinmetcalf.svg)](https://saucelabs.com/u/calvinmetcalf)
