exports.build=function(){
var fs = require("fs");
var c = fs.readFileSync("./communist.js", "utf8");
var w = fs.readFileSync("./worker.js", "utf8");
var r = 'window.URL = window.URL || window.webkiURL;\n\tvar blob = new Blob(["'+ w.slice(0,-1)+ '"]);\n\tvar w = window.URL.createObjectURL(blob);';
var cc=c.replace("var w='worker.js';",r);
fs.writeFile("communist-src.js",cc);
}
