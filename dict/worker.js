var fun = function (url, cb) {
	var request = new XMLHttpRequest();
	request.open("GET", url);
	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status === 200) {
			cb(request.responseText);
			}
			};
			request.send();
			};
			function fromText(text){
				var len = text.length;
				var ab = new Uint16Array(len);
				var i = 0;	while(i<len){	
					ab[i]=text.charCodeAt(i);	
					i++;
					};	
					return ab;
					};	
					function _clb(data){	
						var d = fromText(data);	
						self.postMessage(d);
						self.close();	
						}	
						var _rst = fun("https://c9.io/calvinmetcalf/communist/workspace/README.md",_clb);			if(typeof _rst !== "undefined"){				_clb(_rst);			}