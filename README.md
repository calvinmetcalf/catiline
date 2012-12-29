Communist
==========
![communist](https://raw.github.com/calvinmetcalf/communist/gh-pages/apple-touch-icon-144x144-precomposed.png)

All about workers, pass it a function, then pass it data and a callback, e.g.

```javascript
var comrade = communist(function(a,b){return a + b});
//creates a worker
comrade.send(1,2,function(err, data){console.log(data)});
//prints 3
comrade.close();
//closes the wroker
```
that works by executing the function each time it gets a messege and returning the results, you can also have it pass messeges back
```javascript
var comrade = communist(function(){
	var f = function(){
		var d = new Date;
		this.send(d.toLocaleTimeString())
	};
	this.setInterval(f,1000);
});
comrade.send(function(err, data){console.log(data)});
//this will print the time every second
comerade.close();
```
make sure you use "this" with setInterval and send if there is any chance it's going to be used in older browsers, though note that when closed it doesn't automatically stop the interval function.

this is actually two scripts Communist, the main one which is for working in an alternative thread, and Socialist which is a(n attempt at) a drop in replacement that runs in thread.  When you call communist, it returns a new Communist or a new Socialist depending on what your browser can handle. 

This is a work in progress, help is always apreciated, I wrote it in CoffeeScript mainly for the splats.

link at the top is for compiled javascript, to build you need Node and then run 
```bash
npm install
```
to get the dependencies and then
```bash
cake build
```
builds
I set up a [quick demo](http://calvinmetcalf.github.com/communist/) of the various aspects. 
