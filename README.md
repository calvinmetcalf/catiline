Communist
==========
![communist](logo.png)

A JavaScrit library all about workers.

API
===
```javascript
var worker = communist({sum:function(a,cb){cb(a[0]+a[1]);},square:function(a){return a*a;});
worker.sum([2,5]).then(function(a){console.log(a);})//prints 7
worker.square(5).then(function(a){console.log(a);})//prints 25
worker.close()//closes the worker, can be overwritten, worker._close() can't be overwritten.
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

pass the data as the second argument and it crunches it returns the data and then closes up for you.

###Want it fancy? MAP REDUCE!!!

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
//fetch takes an argument "now", if it's undefined then 
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

###Misc

we have a few utility functions you can use

`communist.makeUrl(reletiveURL);` returns an absolute url and

`communist.worker([aray of strings]);` returns worker made from those strings.

```communist.ajax(url[,after,notjson]);``` returns promise, after is a function to call on the data after download in the worker, notjson should be true if you don't want to run JSON.parse on it.

`communist.deferred();` makes a new promise and returns it, used internally.

This grew out of my work with [earlier versions](https://github.com/calvinmetcalf/communist/tree/6e920be75ab3ed9b2a36d24dd184a9945f6b4000) of  this library and [Parallel.js](https://github.com/adambom/parallel.js).  Uses [Promiscuous](https://github.com/RubenVerborgh/promiscuous/) for promises, either include dist/communist[.min].js.
