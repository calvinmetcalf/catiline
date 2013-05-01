function objWorker(obj){
	var w = new Communist();
	var i = 0;
	if(!("initialize" in obj)){
		obj.initialize=function(){};
	}
	var fObj="{";
	var keyFunc=function(key){
		var out = function(){
			var args = Array.prototype.slice.call(arguments);
			return worker.data([key,args]);
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
		var cont,obj,key;\n\
		if(data[0]==="__start__"){\n\
			obj = '+fObj+';\n\
			for(key in obj){\n\
				this[key]=obj[key];\n\
			};\n\
			this.initialize();\n\
			return true;\n\
		}\n\
		else{\n\
			cont =data[1];\n\
			cont.push(cb);\n\
			return this[data[0]].apply(this,cont);\n\
		}\n\
	}';
	var worker = sticksAround(fun);
	w._close=worker.close;
	worker.data(["__start__"]);
	return w;
}