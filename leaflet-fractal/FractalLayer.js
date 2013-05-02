   

//functions return number from 0 to (maxIter-1)
var obj  = {
    'mandlebrot': function(cx, cy, maxIter) {
        var iter, xn, x = 0, y = 0;
        for (iter = 0; x*x + y*y < 4&&iter < maxIter; iter++) {
            xn = x*x - y*y + cx;
            y = (x*y)*2 + cy;
            x = xn;
        }
        
        return iter;
    },
    'burningShip': function(cx, cy, maxIter) {
        var iter, xn, x = 0, y = 0;
        for (iter = 0; x*x + y*y < 4&&iter < maxIter; iter++) {
            xn =  x*x - y*y - cx;
            y = 2*Math.abs(x*y) + cy;
            x = xn;
        }
        
        return iter;
    },
    'multibrot': function(cx, cy, maxIter, cr) {
        var iter, xn, x = 0, y = 0,n1,n2,n3;
        for (iter = 0; x*x + y*y < 4&&iter < maxIter; iter++) {
            n3=(x*x+y*y);
            if(!n3){
                x=cx;
                y=cy;
                continue;
            }
            n1=Math.pow(n3,(cr>>1));
            n2=cr*Math.atan2(y,x);
            xn=n1*Math.cos(n2) + cx;
            y=n1*Math.sin(n2) + cy;
            x = xn;
        }
        
        return iter;
    },
    'multibrot3': function(cx, cy, maxIter) {
        var iter, xn, x = 0, y = 0;
        for (iter = 0; x*x + y*y < 4&&iter < maxIter; iter++) {
            xn=Math.pow(x,3)-3*x*Math.pow(y,2) + cx;
            y=3*Math.pow(x,2)*y-Math.pow(y,3) + cy;
            x = xn;
        }
        
        return iter;
    },
   'multibrot5': function(cx, cy, maxIter) {
        var iter, xn, x = 0, y = 0;
        for (iter = 0; x*x + y*y < 4&&iter < maxIter; iter++) {
            xn=Math.pow(x,5)-(10*Math.pow(x,3)*Math.pow(y,2))+(5*x*Math.pow(y,4)) + cx;
            y=(5*Math.pow(x,4)*y)-(10*x*x*Math.pow(y,3))+Math.pow(y,5) + cy;
            x = xn;
        }
        
        return iter;
    },
    'tricorn': function(cx, cy, maxIter) {
        var iter, xn, x = 0, y = 0;
        for (iter = 0; x*x + y*y < 4&&iter < maxIter; iter++) {
            xn =  x*x - y*y - cx;
            y =(x+x)*(-y) + cy;
            x = xn;
        }
        
        return iter;
    },
    'julia': function(cx, cy, maxIter, cr, ci) {
        var iter, xn, x = cx, y = cy;
        for (iter = 0; x*x + y*y < 4&&iter < maxIter; iter++) {
            xn = x*x - y*y + cr;
            y = (x*y)*2 + ci;
            x = xn;
        }
        
        return iter;
    }
}
obj.initialize=function(){this.colors=new Uint32Array([4281282495,4281283263,4281283775,4281284287,4281285055,4281285567,4281286335,4281286847,4281287359,4281288127,4281288639,4281289407,4281289919,4281290431,4281291199,4281291711,4281292479,4281292991,4281293503,4281294271,4281294783,4281295551,4281296063,4281296575,4281297343,4281297855,4281298367,4281299135,4281299647,4281300415,4281300927,4281301439,4281302207,4281302719,4281303487,4281303999,4281304511,4281305279,4281305791,4281306559,4281307071,4281307583,4281308351,4281308863,4281309631,4281310143,4281310655,4281311423,4281311935,4281312447,4281313215,4281313727,4281314495,4281315007,4281315519,4281316287,4281316799,4281317567,4281318079,4281318591,4281319359,4281319356,4281319354,4281319352,4281319349,4281319347,4281319344,4281319342,4281319340,4281319337,4281319335,4281319332,4281319330,4281319328,4281319325,4281319323,4281319321,4281319318,4281319316,4281319313,4281319311,4281319309,4281319306,4281319304,4281319301,4281319299,4281319297,4281319294,4281319292,4281319289,4281319287,4281319285,4281319282,4281319280,4281319277,4281319275,4281319273,4281319270,4281319268,4281319266,4281319263,4281319261,4281319258,4281319256,4281319254,4281319251,4281319249,4281319246,4281319244,4281319242,4281319239,4281319237,4281319234,4281319232,4281319230,4281319227,4281319225,4281319222,4281319220,4281319218,4281319215,4281515823,4281646895,4281777967,4281974575,4282105647,4282302255,4282433327,4282564399,4282761007,4282892079,4283088687,4283219759,4283350831,4283547439,4283678511,4283875119,4284006191,4284137263,4284333871,4284464943,4284661551,4284792623,4284923695,4285120303,4285251375,4285382447,4285579055,4285710127,4285906735,4286037807,4286168879,4286365487,4286496559,4286693167,4286824239,4286955311,4287151919,4287282991,4287479599,4287610671,4287741743,4287938351,4288069423,4288266031,4288397103,4288528175,4288724783,4288855855,4288986927,4289183535,4289314607,4289511215,4289642287,4289773359,4289969967,4290101039,4290297647,4290428719,4290559791,4290756399,4290755631,4290755119,4290754607,4290753839,4290753327,4290752559,4290752047,4290751535,4290750767,4290750255,4290749487,4290748975,4290748463,4290747695,4290747183,4290746671,4290745903,4290745391,4290744623,4290744111,4290743599,4290742831,4290742319,4290741551,4290741039,4290740527,4290739759,4290739247,4290738479,4290737967,4290737455,4290736687,4290736175,4290735407,4290734895,4290734383,4290733615,4290733103,4290732591,4290731823,4290731311,4290730543,4290730031,4290729519,4290728751,4290728239,4290727471,4290726959,4290726447,4290725679,4290725167,4290724399,4290723887,4290723375,4290722607,4290722095,4290721327,4290720815,4290720303,4290719535,4290719538,4290719540,4290719542,4290719545,4290719547,4290719550,4290719552,4290719554,4290719557,4290719559,4290719562,4290719564,4290719566,4290719569,4290719571,4290719574,4290719576,4290719578,4290719581,4290719583,4290719586,4290719588,4290719590,4290719593,4290719595,4290719597,4290719600,4290719602,4290719605,4290719607,4290719609,4290719612,4290719614,4290719617,4290719619,4290719621,4290719624,4290719626,4290719629,4290719631,4290719633,4290719636,4290719638,4290719641,4290719643,4290719645,4290719648,4290719650,4290719652,4290719655,4290719657,4290719660,4290719662,4290719664,4290719667,4290719669,4290719672,4290719674,4290719676,4290719679,4290523071,4290391999,4290260927,4290064319,4289933247,4289736639,4289605567,4289474495,4289277887,4289146815,4288950207,4288819135,4288688063,4288491455,4288360383,4288229311,4288032703,4287901631,4287705023,4287573951,4287442879,4287246271,4287115199,4286918591,4286787519,4286656447,4286459839,4286328767,4286132159,4286001087,4285870015,4285673407,4285542335,4285345727,4285214655,4285083583,4284886975,4284755903,4284624831,4284428223,4284297151,4284100543,4283969471,4283838399,4283641791,4283510719,4283314111,4283183039,4283051967,4282855359,4282724287,4282527679,4282396607,4282265535,4282068927,4281937855,4281741247,4281610175,4281479103,4290719679]);
}
obj.workerFunc = function(data,cb) {
    var scale = Math.pow(2, data.z - 1);
    var x0 = data.x / scale - 1;
    var y0 = data.y / scale - 1;
    var d = 1/(scale<<8);
    var pixels = new Array(65536);
    var MAX_ITER=data.maxIter;
    var c,cx,cy,iter,i=0,px,py,a1,a2,a3,a4;
    
    while (i < 65536) {
        px = i%256;
        py = (i-px)>>8;
        cx = x0 + px*d;
        cy = y0 + py*d;    
        iter = this[data.type](cx, cy, MAX_ITER, data.cr, data.ci);
        c = ~~((iter/MAX_ITER)*360);
        pixels[i++] = this.colors[c];
        pixels[i++] = this.colors[c];
    }
    i=1;
    while (i < 65536) {
        px = i%256;
        py = (i-px)>>8;
        cx = x0 + px*d;
        cy = y0 + py*d;
        if(!px||!py||!px%255||py%255){
            iter = this[data.type](cx, cy, MAX_ITER, data.cr, data.ci);
            c = ~~((iter/MAX_ITER)*360);
            pixels[i++] = this.colors[c];
        }
        else{
                a1=pixels[i+1];
                a2=pixels[i-1];
                a3=pixels[i+256];
                a4=pixels[i-256];
                if(a1===a2&&a2===a3&&a3===a4){
                    i++;
                }else{
                    iter = this[data.type](cx, cy, MAX_ITER, data.cr, data.ci);
                    c = ~~((iter/MAX_ITER)*360);
                    pixels[i++] = this.colors[c];           
                }
            }
        i++;
    }
    data.pixels = (new Uint32Array(pixels)).buffer;
    cb(data,[data.pixels]);
};


L.TileLayer.FractalLayer = L.TileLayer.Canvas.extend({
    options: {
		async: true,
		maxZoom:23,
        continuousWorld:true
	},
	initialize: function (numWorkers,fractalType,maxIter,cr,ci) {
        this.fractalType = fractalType || "mandlebrot";
		this.numWorkers = numWorkers;
		this._workers = new Array(this.numWorkers);
      
        this.messages={};
        this.queue={total: numWorkers};
        this.cr = cr || -0.74543;
        this.ci = ci || 0.11301;
        this.maxIter = maxIter || 500;
       
	},
    onAdd: function(map) {
        var _this = this;
    	var i = 0;
        this.queue.free = [];
        this.queue.len =0;
        this.queue.tiles = [];
    	while(i<this.numWorkers){
            this.queue.free.push(i);
		    this._workers[i]=communist(obj);
		    i++;
		}
        
        this.on("tileunload", function(e) {
            if(e.tile._tileIndex){
                var pos = e.tile._tileIndex,
                    tileID = [pos.x, pos.y, pos.z].join(':');
                if(tileID in _this.messages){
                    delete _this.messages[tileID];
                }
            }
        });
        
         map.on("zoomstart",function() {
            this.queue.len = 0;
            this.queue.tiles = [];
        }, this);
        return L.TileLayer.Canvas.prototype.onAdd.call(this,map);
    },
    onRemove:function(map){
        this.messages={};
        var len = this._workers.length;
        var i =0;
            while(i<len){
            this._workers[i]._close();
            i++;
        }
        return L.TileLayer.Canvas.prototype.onRemove.call(this,map);
    },
	drawTile: function (canvas, tilePoint) {
        if(!this.queue.free.length){
            this.queue.tiles.push([canvas,tilePoint]);
            this.queue.len++;
        }else{
            this._renderTile(canvas, tilePoint,this.queue.free.pop());
        }
	},
    _renderTile: function (canvas, tilePoint,workerID) {
        var z = this._map.getZoom();
    	canvas._tileIndex = {x: tilePoint.x, y: tilePoint.y, z: z};
        var tileID=tilePoint.x+":"+tilePoint.y+":"+z;
        this.messages[tileID]=canvas;
        var msg = {
            x: tilePoint.x, 
            y:tilePoint.y, 
            z: z,
            tileID: tileID,
            workerID: workerID,
            cr: this.cr,
            ci: this.ci,
            maxIter: this.maxIter,
            type: this.fractalType,
            start:Date.now()
        };
        var _this = this;
        this._workers[workerID].workerFunc(msg).then(function(data) {
                console.log(Date.now()-data.start+":"+data.tileID)
                var canvas,next;
                if(_this.queue.len) {
                    _this.queue.len--;
                    next = _this.queue.tiles.shift();
                    _this._renderTile(next[0],next[1],data.workerID);
                } else {
                    _this.queue.free.push(data.workerID);
                }
                if (data.tileID in _this.messages) {
                    canvas = _this.messages[data.tileID];
                } else {
                    return;
                }
                console.log(data);
                var array=new Uint8Array(data.pixels);
                var ctx = canvas.getContext('2d');
                var imagedata = ctx.getImageData(0, 0, 256, 256);
                imagedata.data.set(array);
                ctx.putImageData(imagedata, 0, 0);
                _this.tileDrawn(canvas);
            },function(a){console.log(a)});
    }
});
L.tileLayer.fractalLayer = function(numWorkers,t,mi,cr,ci){
	return new L.TileLayer.FractalLayer(numWorkers,t,mi,cr,ci);
}