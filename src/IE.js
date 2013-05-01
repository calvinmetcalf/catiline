if (typeof document === "undefined") {
	self._noTransferable=true;
	self.onmessage=function(e){
		eval(e.data);	
	}
} else {
(function(){
	"use strict";