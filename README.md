communist
=========

All about workers, pass it a function, then pass it data and a callback, e.g.

```javascript
var comrade = communist(function(a,b){return a + b});
//creates a worker
comrade.send(1,2,function(err, data){console.log(data)});
//prints 3
comrade.close();
//closes the wroker
```

on browsers that don't support web workers function is executed in normal process.

The worker has access to to a function "send" which it can use to send messeges back without returning, be careful with this and certain built in methods, e.g setInterval will reset scope on you.

I set up a [quick demo](http://calvinmetcalf.github.com/communist/)
