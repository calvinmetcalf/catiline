var communist = function(fun){
    if(typeof fun === "function"){
        window.URL = window.URL || window.webkiURL;
        var func = fun.toString();
        var body = "var f = " + func + "self.addEventListener('message', function(e) {self.postMessage(f(data.e))})";
        var blob = new Blob([body]);
        var bUrl = window.URL.createObjectURL(blob);
        var _worker = new Worker(bUrl);
        this.prototype.send = function(data,cb){
        _worker.postMessage(data);
  
             _worker.onmessage = function(e){cb(e.data)};
             return;
       
        
        };
        this.prototype.close = function(){
            _worker.terminate();
        };
    }
};