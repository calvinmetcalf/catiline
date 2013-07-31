function communist(object,queueLength,unmanaged){
	if(arguments.length === 1 || !queueLength || queueLength <= 1){
		return new communist.Worker(object);
	}else{
		return new communist.Queue(object,queueLength,unmanaged);
	}
}

function initBrowser(communist){
	var origCW = global.cw;
	communist.noConflict=function(newName){
		global.cw = origCW;
		if(newName){
			global[newName]=communist;
		}
	};
	global.communist = communist;
	global.cw = communist;
	
}
if(typeof module === "undefined" || !('exports' in module)){
	initBrowser(communist);
} else {
	module.exports=communist;
}
