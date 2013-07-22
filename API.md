API
===
```javascript
var worker = cw({
	sum:function(a,callback){
		callback(a[0]+a[1]);
	},
	square:function(a){
		return a*a;
	}
});
worker.sum([2,5]).then(function(a){
	console.log(a);
})//prints 7
worker.square(5).then(function(a){
	console.log(a);
})//prints 25
worker.close()//closes the worker, can be overwritten, worker._close() can't be.
```

Give it an object of functions, and you can call them by name, your functions can either return a value or call a callback function which is passed as the second argument.
Call the function with the data as the first argument and a transfer list for the second.
It takes two arguments, data and an optional list of any arrayBuffers to transfer ownership of.
If you want to do things once when the worker is created pass a function called `initialize` or `init` this gets called once with no arguments.  All workers are called in the same context so
`this` can be used to store things, functions can also use `this` to call each other. 

If you only have one function you’re going to be using, you can omit the object and give it a single function.  This is a shortcut from `cw(yourfunc)`to`cw({data:yourfunc})`.

```javascript
var worker = cw(function(a,callback){
	callback(a[0]+a[1]);
});
worker.data([2,5]).then(function(a){
	console.log(a);
})//prints 7
worker.close();//close it up
```

For slightly more complex communication patterns you can fire events between the the two contexts with 'on', 'fire', and 'off' events.

```javascript
var worker = cw(function(text){
	var target = 4;
	var words = text.split(' ');
	words.forEach(function(word){
		if(word.length === target){
			this.fire('match',word);
		};
	},this);
});

worker.on('match',function(a){
	console.log(a);
});

worker.data('Give it an object of functions, and you can call them by name, your functions can either return a value or call a callback function which is passed as the second argument.')
/*prints
Give
call
them
your
call
*/
```

The event system was inspired by [Leaflet's](http://leafletjs.com/reference.html#events) but with a similar set of methods. Multiple space separated words can
but sent to the 'on' and 'off' methods and `off` accepts a function if you only want to delete one of many functions, `on` takes a scope argument in its 3rd spot.

###Importing Scripts
If you create a worker and the function imports a script like

```javascript
function(base,cb){
	importScripts('dist/shp.js');
	shp(base).then(cb);
}
```

it will be rewritten inside the worker as 

```javascript
importScripts('http://full/path/to/dist/shp.js');
function(base,cb){
	shp(base).then(cb);
}
```

In other words it will be hoisted out of the function so it will only be called once, and it will rewrite all the URLs to be absolute.

###Queues

```javascript
var workers = cw({
	sum:function(a,callback){
		callback(a[0]+a[1]);
	},
	square:function(a){
		return a*a;
	}
},4);
```

Just add a number after the object and it will create that number or workers. Then calls will be divided among them, you can also call bulk methods works just like the regular method but also can call bulk methods which return arrays:


```javascript
workers.square(4).then(function(a){
	console.log(a);
});//normal way prints 16;
workers.batch.square([1,2,3,4,5,6,7,8]).then(function(a){
	console.log(a);
});//bulk prints [1,4,9,16,25,36,49,64]
```

if you give it a callback then it calls the callback for each of the bulk items instead of waiting for all to be done.

```javascript
var workers = cw({
	sum:function(a,callback){
		callback(a[0]+a[1])
	},
	square:function(a){
		return a*a;
	}
},4);
workers.square(4).then(function(a){
	console.log(a);
});//the same way prints 16;
workers.batch(function(a){
	console.log(a);
}).square([1,2,3,4,5,6,7,8]);/*prints:
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
To cancel a queue calling `workers.batch('msg')` will clear the current data and reject all the promises.

If you want to dispense with the queuing system you can also do a dumb queue

```javascript
var workers = cw({
	sum:function(a,callback){
		callback(a[0]+a[1]);
	},
	square:function(a){
		return a*a;
	}
},4,'dumb');
```

which is exactly like the other queue but instead of carefully queuing and only giving data to workers that are ready, it sprays the workers with the data completely randomly until it's out of data, think very carefully before using
can lead to "three stooges syndrome" where all the results come back at exactly the same time and freeze the dom.

can use bulk and callback with it too but results may be different

```javascript
var workers = cw({
	sum:function(a,callback){
		callback(a[0]+a[1]);
	},
	square:function(a){
		return a*a;
	}
},4,'dumb');
workers.batch(function(a){
	console.log(a);
}).square([1,2,3,4,5,6,7,8]);/* prints
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

###Misc

we have a few utility functions you can use

`cw.makeUrl(reletiveURL);` returns an absolute url and

`cw.makeWorker([array of strings]);` returns worker made from those strings.

`cw.deferred();` makes a new promise and returns it, used internally. Technically `cw` is a shortcut to [Promiscuous](https://github.com/RubenVerborgh/promiscuous/) which is used for promises, so any of Promiscuous's methods can be used, aka call `cw.resolve(value)` for an already resolved promise and `cw.reject(reason)` for a rejected one. Lastly you can call `cw.all([promises])` on an array of promises, should work just like `Q.all()`.

`cw.setImmediate();` implements [setImmediate](https://github.com/NobleJS/setImmediate), at least the parts that apply to non web workers that can create web workers.

lastly `cw.noConflict()` sets `cw` back to what it was before loading this library and you can use the function via `communist()`

