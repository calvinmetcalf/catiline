function objWorker(obj){
	var w = new Communist();
	var i = 0;
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
	
	var fun = 'function(data,cb){\n\
		var cont;\n\
		if(data[0]==="__start__"){\n\
			_self.obj = '+fObj+';\n\
			return true;\n\
		}\n\
		else{\n\
		cont =data[1];\n\
		cont.push(cb);\n\
		return _self.obj[data[0]].apply(null,cont);\n\
		}\n\
	}';
	var worker = sticksAround(fun);
	w._close=worker.close;
	worker.data(["__start__"]);
	return w;
}