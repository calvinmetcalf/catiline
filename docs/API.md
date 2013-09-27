API
===

```javascript
cw(Object or Function[, Number, Boolean])
	-> worker object
```

is the basic signature but it should be noted that

```javascript
cw(Function[, Number, Boolean])
```

is actually a shortcut to

```javascript
cw({data:Function}[, Number, Boolean])
```

if number is specified, truthy, and greater then 1 then `cw()` is actually a shortcut to `new cw.Queue`,
otherwise it is a shortcut to `new cw.Worker()`

##cw.Worker

the object passed to the constructor is in the format of keys which map to functions
the keys of this object are turned into methods of the returned worker object
additionally if a key with the value 'initialize' is present then its function is
invoked in the worker as soon as the worker is created with the signature:

```javascript
scope.initialize(scope)
```

As a convenience if key named
'init' is present and a key named 'initialize' is not present then obj['initialize']
is set to obj['init'].

methods of the worker object derived from keys have the followinging signature

```javascript
worker.method(data[,transfer:Array])
	->promise
```

it is called with any arbatraty data that can be serialized by structured cloning
and and optional array of buffers to transfer and it returns a promise. 
In the worker the function specified is called with the signature

```javascript
scope.method(data, callback, scope)
```

This function can resolve by either passing a value to the callback function or returning a defined value (aka typeof value !== 'undefined')
it may only resolve once, if it calls the callback more then once or returns a values and calls callback 1 or more times an error will occur.

The worker object also has a method _close which may be used to close the worker

```javascript
worker._close()
	->promise
```

there is also a shortcut function of `worker.close()` which may be overwritten, 
`worker._close()` will overwrite the method name on the worker object but not inside the worker.
The promise always resolves successfully.

The functions in the worker are always called as a method if the 'scope' object meaning 
function 'a' may call function 'b' as `this.b()` internally, furthermore as a convenience
the scope is passed as the last parameter when functions are invoked (this is the 3rd parameter for most function except 
'initialize' where it is the first and only parameter). Meaning function 'a' could do:

```javascript
function(data,callback,scope){
	scope.b();
}
```

the worker object and the scope object both have 3 additional methods
`on`, `one`, `off`, and `fire` for working with events. For these 3 methods the following definitions a being used

'event name' can be any JavaScript string that does not include a space.

'event string' is one or more event names seperated by spaces.

```javascript
workerORscope.on('event string', listnener:Function[,contect:Object])
	->workerORscope
workerORscope.one('event string', listnener:Function[,contect:Object])
	->workerORscope
```

the listner function is called with the signatrue, on and one are identical except one is onle called once.

```
listnener(data,scope);
```

by default scope and context (third argument, `this` inside the listner) are the same
and be aware changing context does not change scope (the scope object is always the same
even if `this` is changed).

```javascript
workerORscope.off('event string')
	->workerORscope
```

removes the listener or listeners in the event string

```javascript
workerORscope.fire('event string'[,data,transfer:Array])
	->workerORscope
```

when called in the main page sends the messege with the data (if any) to the worker
and transfering any buffers if they are specified when called in the worker it gets sent
to the main page.

Internally on before workers are created any ImportScripts() declarations are hoisted into the global worker scope and 
deduped.

##cw.Queue

A queue which can be accessed as described above has the signature

```javascript
new cw.Queue(Object ,Number [,Boolean])
	-> CatilineQueue
```

A queue can be treated exactly like a worker and it will behave identically except
there will be a number of workers equal to the number specified in parameter two.

If parameter 3 is falsy (or omited) then it is a 'Managed Queue' and when methods are called
then if a worker is free, the call is forwarded to a worker like normal, the worker is
noted to be busy when the worker responds the promise is resolved like normal and the worker is noted as being free.
Data is only given to free workers and if all workers are busy it is placed in a queue and will be
sent to workers on a FIFO basis as they become free.

If parameter 3 is truthy then on each all to queue object a worker is picked at random and the data is sent to that one.

Queues also have properties called 'batch' and 'batchTransfer' which have the same methods as the provided object.

In other words if this queue was created

```javascript
var queue = cw({method:function});
```

not only would there be `queue.method()` method but also `queue.batch.method()` and `queue.batchTransfer.method()`.

'queue.batch.method' is like queue.method except it takes an array of values and divides them among the workers
based on the queue stratagy. If they all resolve successfully then the promise resolves with an array of the results in the same order as the input values.
If a function has an error then the returned promises is rejected.

'queue.batchTransfer.method' is identical to 'queue.batch.method' but instead of an array of values
it accepts an array of arrays of length 2 in with the first element the value and the second an array of buffers to transfer, aka: `[value,[buffers]]`

if batch or batchTransfer are given a function when the method is called then that function will be called with each result, aka

```javascript
queue.batch(Function).method([Array])
```

function will be called with each result (will not be called in case of an error).

if batch is given a string it will clear the managed queue and it will reject all callbacks, aka 


```javascript
queue.batch.method([Array])
queue.batch('stopit');
```

##Utility functions

'''javascript
cw.makeUrl(reletiveUrl:String)
	->absoluteUrl
```

Takes a reletive url and returns an absolute one, handy as reletive urls will resolve badly inside a blob worker.

'''javascript
cw.setImmediate(func)
```

executes `func` in the next event loop, think `setTimeout(func,0);` but faster.

```javascript
cw.deferred();//creates deffered object
cw.resolve(value);//create resolved promise
cw.reject(value);//create rejected promise
cw.all([promises]);
//returns a promise for an array of promsies
//resolved value is array of results in order.
```
