Detailed API
===

```javascript
cw(Object or Function[, number, boolian])
	-> worker object
```

is the basic signature but it should be noted that

```javascript
cw(Function[, number, boolian])
```

is actually a shortcut to

```javascript
cw({data:Function}[, number, boolian])
```

if number is specified, truthy, and greater then 1 then a queue object is returned,
otherwise a single worker object is returned

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

