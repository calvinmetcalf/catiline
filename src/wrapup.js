Catiline.setImmediate = Catiline.nextTick;
function initBrowser(Catiline){
	const origCW = global.cw;
	Catiline.noConflict=function(newName){
		global.cw = origCW;
		if(newName){
			global[newName]=Catiline;
		}
	};
	global.catiline = Catiline;
	global.cw = Catiline;
	if(!('communist' in global)){
		global.communist=Catiline;
	}
	
}

if(typeof define === 'function'){
	define(function(require){
		Catiline.SHIM_WORKER_PATH=require.toUrl('./catiline.js');
		return Catiline;
	});
}else if(typeof module === 'undefined' || !('exports' in module)){
	initBrowser(Catiline);
} else {
	module.exports=Catiline;
}
