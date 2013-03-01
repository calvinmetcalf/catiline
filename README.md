Communist
==========
![communist](logo.png)

A library all about workers that grew out of my work with [earlier versions](https://github.com/calvinmetcalf/communist/tree/6e920be75ab3ed9b2a36d24dd184a9945f6b4000) of  this library and [Parallel.js](https://github.com/adambom/parallel.js).  You want Node.js and IE support and for it not to blow up? go use Parallel.js, at the moment that's not what I'm going for here. Requires [RSVP](https://github.com/tildeio/rsvp.js).

API
===
Create a onetime use worker:

```JavaScript
var comrade = communist(function,data);//returns promise
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
var comrade = communist(function);//returns object
var manifesto = comrade.data(data);//returns promise
comrade.close();//closes the worker
```

you can call data on multiple times and each time will return a new promise which will be fuffiled based on your data, otherwise the same as the onetime worker.
