communist
=========

All about workers, pass it a function, then pass it data and a callback, e.g.

```javascript
var asyncFunc = communist(function(a,b){return a + b});
//creates a worker
asyncFunc.send(1,2,function(err, data){console.log(data)});
//prints 3
asyncFunc.close();
//closes the wroker
```

on browsers that don't support web workers function is executed in normal process. 
