function objWorker(obj){
	var w = new Communist();
	var i = 0;
	if(!("initialize" in obj)){
		obj.initialize=function(){};
	}
	var fObj="{";
	var keyFunc=function(key){
		var out = function(data, transfer){
			return worker.data([key,data], transfer);
		};
		return out;	
		};
	for(var key in obj){
		if(i!==0){
			fObj=fObj+",";
		}else{
			i++;
		}
		fObj=fObj+key+":"+obj[key].toString();
		w[key]=keyFunc(key);
	}
	fObj=fObj+"}";
	
	var fun = '\n\
	function(data,cb){\n\
		var obj,key;\n\
		if(data[0]==="__start__"){\n\
			obj = '+fObj+';\n\
			for(key in obj){\n\
				this[key]=obj[key];\n\
			};\n\
			this.initialize();\n\
			return true;\n\
		}\n\
		else{\n\
			return this[data[0]](data[1], cb);\n\
		}\n\
	}';
	var worker = sticksAround(fun);
	w._close=worker.close;
    if(!w.close){
        w.close=w._close;
    }
	worker.data(["__start__"]);
	return w;
}
