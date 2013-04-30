if (typeof document === "undefined") {
	self.onmessage=function(e){
		eval(e.data);	
	}
} else {
(function(){
	"use strict";