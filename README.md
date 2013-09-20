__Catiline.js__ is a JavaScript library all about workers. Workers should make your life easier, not harder, and with Catiline.js launching a new worker is as simple as calling a function. It works the same across all (modern) browsers. Formerly known as Communist.js, Catiline.js is the same great library with a less controversial name.

How easy is it? `var worker = cw(myFunc)` creates a worker. Send it data with `var response = worker.data(YOUR DATA);`, and the response is a [promise](http://blogs.msdn.com/b/ie/archive/2011/09/11/asynchronous-programming-in-javascript-with-promises.aspx). It's that easy. For more in-depth usage, checkout the examples bellow or the 

<a class='navLink' id='API' href='docs/API.md'>API page</a>.

Want to use it? Grab the 
[development version](https://raw.github.com/calvinmetcalf/catiline/master/dist/catiline.js)
or [production version](https://raw.github.com/calvinmetcalf/catiline/master/dist/catiline.min.js) from the dist folder. 

For usage in addition to the <a class='navLink' id='API' href='docs/API.md'>API page</a> and <a class='navLink' id='DOCUMENTATION' href='docs/DOCUMENTATION.md'>documentation</a>, I wrote a [blog post](http://cwmma.tumblr.com/post/54338607071/making-web-workers-with-communistjs) about Catiline.js (under its old name). Or, you can browse some demos:

- [Parsing a dictionary](http://catilinejs.com/website/dict/)
- [Fractal Map](http://catilinejs.com/website/leaflet-fractal/), (April Mozilla Dev Derby [Finalist](https://hacks.mozilla.org/2013/06/announcing-the-winners-of-the-april-2013-dev-derby/))
- [RTree Bounding Boxes](http://leaflet-extras.github.io/RTree/examples/worker.html)
- [Census Visualization](http://data-otp.rhcloud.com/)
- [Vector Map Tiles](http://calvinmetcalf.github.io/vector-layers/)
- [Unzipping files and reprojecting maps](http://calvinmetcalf.github.io/shapefile-js/site/proj.html)

Updates and changes are all in the <a class='navLink' id='CHANGELOG' href='docs/CHANGELOG.md'>changelog</a>.

There is also a <a class='navLink' id='PLUGINS' href='docs/PLUGINS.md'>plugin list</a>.

__Important:__ the file catiline.js or catiline.min.js should be a standalone file hosted on the same domain as your web page. If you can't, or need to bundle catiline but you need it to work on IE10, Opera, and Safari, you have to host the file "SHIM_WORKER.js" on the same domain as the html file 
and set the path to it in a global variable `SHIM_WORKER_PATH` before you load catiline.

This grew out of my work with [earlier versions](https://github.com/calvinmetcalf/catiline/tree/6e920be75ab3ed9b2a36d24dd184a9945f6b4000) 
of this library and my [differences in opinion](https://gist.github.com/calvinmetcalf/6050205) with
[Parallel.js](https://github.com/adambom/parallel.js)'s direction. There is
also a library doing very similar things called [operative](https://github.com/padolsey/operative).

[![Selenium Test Status](https://saucelabs.com/browser-matrix/calvinmetcalf.svg)](https://saucelabs.com/u/calvinmetcalf)
