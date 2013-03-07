Communist
==========
![communist](logo.png)

A library all about workers that grew out of my work with [earlier versions](https://github.com/calvinmetcalf/communist/tree/6e920be75ab3ed9b2a36d24dd184a9945f6b4000) of  this library and [Parallel.js](https://github.com/adambom/parallel.js).  You want Node.js ~~and IE support~~ (have that now) and for it not to blow up? go use Parallel.js, at the moment that's not what I'm going for here. Requires [RSVP](https://github.com/tildeio/rsvp.js).

API
===
Create a onetime use worker:

```JavaScript
var worker = communist(function,data);//returns promise
```

calls your function with the data as the first argument and a callback as the second in a worker, the function can either return a value, or call the callback, once it does that, the promise is fufiled and the worker is closed. , ie:

```JavaScript
function(x){
	return x*x;
}
//or
function(x,cb){
	cb(x*x);
}
//all together
communist(function(x){return x*x;},9).then(function(a){console.log(a)});
//prints 81.
```

Create a reusable worker:

```JavaScript
var worker = communist(function);//returns object
var manifesto = worker.data(data);//returns promise
worker.close();//closes the worker
```

you can call data on multiple times and each time will return a new promise which will be fufiled based on your data, otherwise the same as the onetime worker.

If you don't feel like messing around with promises or you need the same callback called multiple times you can pass a callback function as the second argument, this gets called with the results each time.

```JavaScript
var worker = communist(fun) = //returns object
worker.data(data);//will call the callback with the result
//this is chainable
communist(function,callback).data(data1).data(data2);
//will call the callback twice, once for each result.
```

next up comes the fancy stuff, map reduce

```Javascript
var worker = communist(threads);//returns object threads is the number of map workers, reducer will be an additional thread
worker.data([array of data]);//can be called multiple times, the arrays will be concated
worker.map(function);//function to be called once on each member of the array
//can be async but only call the callback once
worker.reduce(function);//reduce function of the function(a,b){return c};
```

this returns a chainable object until it has all it needs, then it returns a promise, e.g.

```JavaScript
var worker = communist(4);
//returns object
worker.data([1,2,3]);
//object
worker.map(function(x){return x*x;});
//object
worker.reduce(function(a,b){return a+b;});
//returns promise
//the object is chainable, and data can be called more then once so....
communist(4)
	.data([1,2,3])
	.map(function(x){return x*x;})
	.data([4,5,6])
	.reduce(function(a,b){return a+b;})
	.then(function(a){console.log(a)});
//prints 91
//remember that once all three data,map and reduced are called it runs, so the following will give you an error:
communist(4)
	.data([1,2,3])
	.map(function(x){return x*x;})
	.reduce(function(a,b){return a+b;})
	.data([4,5,6])
	.then(function(a){console.log("yay "+a)},function(a){console.log("boo "+a)});
```

Behind the scenes it's spinning a worker up for each thread plus one for the reducer, chrews through your data, then gives you result and cleans up.

you can also give a second argument after threads, if this is true than you have an incremental map reduce, we can keep on adding data, then we can call fetch() to get the promise, fetch waits until the data queue is empty and then invokes the primse, it takes an argument "now" that you can set to true if you don't want to wait, i.e. if data is continusly being added. 
it also has a close method which works like fetch but always waits, prevents you from adding more data and then cleans up the workers afterwards. 

```JavaScript
var worker = communist(4, true);
worker.data([1,2,3]);
worker.map(function(x){return x*x;});
worker.reduce(function(a,b){return a+b;});
worker.data([4,5,6]);
worker.fetch().then(function(a){console.log(a)});
//prints 91
worker.data([6,7,8]).fetch().then(function(a){console.log(a)});
//prints 240
//fetch takes an argument "now", if it's undefined then 
worker.data([6,7,8]).fetch(true).then(function(a){console.log(a)});
//also returns 240
worker.close().then(function(a){console.log(a)});
//returns 389
```

We also have communist.reducer, this is the internal function we use for the mapreduce stuff, give it two function, a reducer, and a callback, then give it .data() and it reduces it, call .fetch() to get it and call the callback and .close() which is like fetch but closes it after. 

we also have `communist.makeUrl(reletiveURL);` returns an absolute url, and communist.worker([aray of strings]); returns worker made from those strings.

Lastly we have communist.ajax(); this is a demo function which uses the above tools (the first worker type actually) to create a function which opens up a worker, does an ajax request, can do some prosesing on it, and returns it.

```JavaScript
var promise = communist.ajax(url,after,notjson);//returns promise obv
//after is an optional function you can add if you want to process the data in the other thread before returning it
//if notjson is true doesn't try to parse it as json which it does by default. 
```

If you want to use it in IE 10 then due to security issues you'll need to put the file IE.js somewhere on the same origin as your web page and call `communist.IEpath = "../path/to/IE.js"`.  Based off [this work around in parallel.js](https://github.com/adambom/parallel.js/pull/16)