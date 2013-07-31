A JavaScript library all about workers. Workers should make your life easier not 
harder and with communistjs launching a new worker is as simple as calling a 
function, and it works the same across all (modern) browsers.

How easy? `var worker = cw(myFunc)` creates a worker, send it data with 
`var response = worker.data(YOUR DATA);`, response is a
[promise](http://blogs.msdn.com/b/ie/archive/2011/09/11/asynchronous-programming-in-javascript-with-promises.aspx).
It's that easy, for more in depth usage checkout the examples bellow or the 
<a class='navLink' id='API' href='API.md'>API page</a>.

Want to use it? Grab the 
[development version](https://raw.github.com/calvinmetcalf/communist/master/dist/communist.js)
or [production version](https://raw.github.com/calvinmetcalf/communist/master/dist/communist.min.js) from the dist folder. 

For usage in addition to the <a class='navLink' id='API' href='API.md'>API page</a> and <a class='navLink' id='DOCUMENTATION' href='DOCUMENTATION.md'>documentation</a>,
I wrote a [blog posts](http://cwmma.tumblr.com/post/54338607071/making-web-workers-with-communistjs)
about communist, or you can browse some demos:

- [Parsing a dictionary](http://communistjs.com/website/dict/)
- [Fractal Map](http://communistjs.com/website/leaflet-fractal/), (April Mozilla Dev Derby [Finalist](https://hacks.mozilla.org/2013/06/announcing-the-winners-of-the-april-2013-dev-derby/))
- [RTree Bounding Boxes](http://leaflet-extras.github.io/RTree/examples/worker.html)
- [Census Visualization](http://data-otp.rhcloud.com/)
- [Vector Map Tiles](http://calvinmetcalf.github.io/vector-layers/)
- [Unzipping files and reprojecting maps](http://calvinmetcalf.github.io/shapefile-js/proj.html)

Updates and changes are all in the <a class='navLink' id='CHANGELOG' href='CHANGELOG.md'>changelog</a>.

There is also a <a class='navLink' id='PLUGINS' href='PLUGINS.md'>plugin list</a>.

__Important:__ the file communist.js or communist.min.js should be a stand alone file hosted on the same domain as your web page, if you can't or need to bundle communist but you need it to work on IE10, Opera, and Safari. You have to host the file "SHIM_WORKER.js" on the same domain as the html file 
and set the path to it in a global variable `SHIM_WORKER_PATH` before you load communist.

This grew out of my work with [earlier versions](https://github.com/calvinmetcalf/communist/tree/6e920be75ab3ed9b2a36d24dd184a9945f6b4000) 
of this library and my [differences in opinion](https://gist.github.com/calvinmetcalf/6050205) with
[Parallel.js](https://github.com/adambom/parallel.js)'s direction. There is
also a library doing very similar things called [operative](https://github.com/padolsey/operative)

[![Selenium Test Status](https://saucelabs.com/browser-matrix/calvinmetcalf.svg)](https://saucelabs.com/u/calvinmetcalf)
