var Communist = function(fun){
    if(typeof fun === "function"){
        window.URL = window.URL || window.webkiURL;
        var func = fun.toString();
        var body = "var f = " + func + ";self.addEventListener('message', function(e) {self.postMessage(f(e.data))})";
        var blob = new Blob([body], { "type" : "text\/javascript" });
        var bUrl = window.URL.createObjectURL(blob);
        var _worker = new Worker(bUrl);
        this.send = function(data,cb){
        _worker.postMessage(data);
  
             _worker.onmessage = function(e){cb(e.data)};
             return;
       
        
        };
        this.close = function(){
            _worker.terminate();
        };
    }
};