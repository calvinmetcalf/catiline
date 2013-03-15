process.on('message', function(e) {
 eval(e.data);
});
