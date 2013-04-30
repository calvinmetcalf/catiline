Communist
==========
![communist](logo.png)

A library all about workers that grew out of my work with [earlier versions](https://github.com/calvinmetcalf/communist/tree/6e920be75ab3ed9b2a36d24dd184a9945f6b4000) of  this library and [Parallel.js](https://github.com/adambom/parallel.js).  Uses [Promiscuous](https://github.com/RubenVerborgh/promiscuous/) for promises, either include dist/communist[.min].js.

API
===
Built around a tremendusly overloaded function named communist:
```JavaScript
comunist(function[, data]);
```
creates a worker and if you give it data it immediately crunches the data in the worker and returns a promise, the worker is then closed automatically.  If you don't send data it returns an object which has a data method that returns a promice, i.e.

```JavaScript
var promise = communist(function(a){return a*a;},9);
promise.then(console.log);
var worker = communist(function(a){return a*a;});
var newPromise = worker.data(9);
newPromise.then(console.log);
//do this as much as you want then call
worker.close();
```

You can also pass an object to the constructor __experimental doesn't don't import any scripts with it errors don't work in node__ :

```javascript
var worker = communist({sum:function(a,b,cb){cb(a+b);},square:function(a){return a*a;});
worker.sum(2,5).then(function(a){console.log(a);})//prints 7
worker.square(5).then(function(a){console.log(a);})//prints 25
worker._close()//closes the worker, if you have a function called _close it will be over written
```

next up comes the fancy stuff, map reduce

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

Note previous version had incremental and non-incremental map reduce, you can still access the non-incremental version by specifying a second parameter but this might be removed in the future but it's better just to call .close() after you specify data,map, and reduce and you will have the same outcome.

If you want access to the reducer function you can with 

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

innerally we have a function we use to make most of this is called with 

```javascript
var worker = communist(function,callback,onerr);
//opens the worker with the function
worker.data(stuff);
//send it data any data that comes back callback is called on
//errs got to onerr if that is not specified callback is called with no data.
worker.close();
//close that
```

don't expect any fanciness here. we also have a couple utility function we have 

`communist.makeUrl(reletiveURL);` returns an absolute url and

`communist.worker([aray of strings]);` returns worker made from those strings.

Lastly we have communist.ajax(); this is a demo function which uses the above tools (the first worker type actually) to create a function which opens up a worker, does an ajax request, can do some prosesing on it, and returns it.

```javascript
var promise = communist.ajax(url[,after,notjson]);//returns promise obv
//after is an optional function you can add if you want to process the data in the other thread before returning it
//if notjson is true doesn't try to parse it as json which it does by default. 
```
