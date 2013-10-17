function runTests(chai,cw,global){
    mocha.setup({
        ui: "bdd",
        globals: ["console","__fxdriver_unwrapped"],
        timeout: 300000
    });
    var assert = chai.assert;

    function aSquare(x,cb) {
	    cb( x * x );
    }
    function square(a){
	    switch(typeof a){
		    case "string": 
			    throw a;
		    case "number":
			    return a*a;
	    }
    }
    function sum(a, b) {
	    return a + b;
    }

    function product(a){
	    return a[0]*a[1];
    }

    var buf;
    if(typeof Uint8Array !== 'undefined'){
	    buf=(new Uint8Array([1,2,3,4,5,6,7,8])).buffer;
    }
    var single = function(func, data){
	    var worker = cw(func);
	    return worker.data(data).then(function(a){
		    worker.close();
		    return a;
	    });
    };
    //cw.URL=true;
    describe('Catiline', function () {
	    describe('Basic', function () {
		    it('should work when given a function and data directly' , function (done) {
			    single(square, 9).then(function (a) { assert.equal(a,81); }).then(done, done);
		    });
		    it('should work when given a function and data async', function (done) {
			    single(aSquare, 9).then(function (a) { assert.equal(a,81); }).then(done, done);
		    });
		    if(typeof Uint8Array !== 'undefined'&&navigator.userAgent.slice(-5).slice(0,2)!=="11"&&navigator.userAgent.slice(0,5)!=="Opera"){//look do you want me to test for old opera or not
			    it('should be able to handle an array buffer', function(done){
				    function wrapUp(){
					    comrade.close();
					    done();
				    }
				    var comrade = cw(function(data,cb){cb(data)});
				    comrade.data((new Uint8Array([1,2,3,4,5,6,7,8])).buffer).then(function(a){assert.equal(a.byteLength,8)}).then(wrapUp,wrapUp);
			    });
			    it('should be able to handle an array buffer as a transferable object', function(done){
				    function wrapUp(){
					    comrade.close();
					    done();
				    }
				    var comrade = cw(function(data,cb){cb(data,[data])});
				    comrade.data(buf,[buf]).then(function(a){assert.equal(a.byteLength,8)}).then(wrapUp,wrapUp);
			    });
		    }
	    });
	    describe('urls', function () {
		    it('should work',function(){
			    assert.equal(location.protocol+'//'+location.host+'/',cw.makeUrl('/'));
		    });
	    });
	    describe('errors', function () {
		    it('should gracefully handle an error in a sticksaround', function (done) {
			    function wrapUp(){
				    comrade.close();
				    done();
			    }
			    var comrade = cw(square);
			    comrade.data("Ermahgerd").then(function(a){a.should.be.an('undefined');},function(a){assert.include(a,"Ermahgerd");}).then(wrapUp, wrapUp);
		    });
		    it('should gracefully handle an error as a oneoff', function (done) {
			    single(square,"Ermahgerd").then(function(a){a.should.be.an('undefined');},function(a){assert.isString(a);}).then(done, done);
		    });
	    });
	    describe('Worker reuse', function () {
		
		    it('should work with callback applied to promise', function (done) {
			    function wrapUp(){
				    comrade.close();
				    done();
			    }
			    var comrade = cw(square)
			    comrade.data(9).then(function (a) { assert.equal(a,81); 
			    comrade.data(62).then(function (a) { assert.equal(a,3844); }).then(wrapUp, wrapUp);
			    });
		    });
		    it('should work with callback applied to promise async', function (done) {
			    function wrapUp(){
				    comrade.close();
				    done();
			    }
			    var comrade = cw(aSquare)
			    comrade.data(9).then(function (a) { assert.equal(a,81); 
			    comrade.data(62).then(function (a) { assert.equal(a,3844); }).then(wrapUp, wrapUp);
			    });
		    });
	    });
	    describe('Import Scripts', function () {
		    it("should be able to import scripts",function (done){
			    self.imported=false;
			    single(function(a){importScripts('fakeLib.js');return a;}, 9).then(function (a) { assert.equal(a,9); }).then(done, done);
		    });
		    it("should be able to import scripts with a space in it",function (done){
			    self.imported=false;
			    single(function(a){importScripts( 'fakeLib.js' );return a;}, 9).then(function (a) { assert.equal(a,9); }).then(done, done);
		    });
		    it("should be able to import scripts with double quotes",function (done){
			    self.imported=false;
			    single(function(a){importScripts("fakeLib.js");return a;}, 9).then(function (a) { assert.equal(a,9); }).then(done, done);
		    });
		    it("should be able to import reletive urls",function (done){
			    self.imported=false;
			    single(function(a){importScripts('../test/fakeLib.js');return a;}, 9).then(function (a) { assert.equal(a,9); }).then(done, done);
		    });
		    it("should be able to import 2 scripts",function (done){
			    self.imported=false;
			    single(function(a){importScripts("fakeLib.js",'../test/fakerLib.js');return a;}, 9).then(function () {},function(a){assert.include(a,"tried to import twice")}).then(done, done);
		    });
		    it("should be able to import 2 scripts that are the same",function (done){
			    self.imported=false;
			    single(function(a){importScripts("fakeLib.js",'../test/fakeLib.js');return a;}, 9).then(function () {},function(a){assert.include(a,"tried to import twice")}).then(done, done);
		    });
		    it("should be able to import 2 scripts in two import scripts",function (done){
			    self.imported=false;
			    single(function(a){importScripts("fakeLib.js");importScripts('../test/fakerLib.js');return a;}, 9).then(function () {},function(a){assert.include(a,"tried to import twice")}).then(done, done);
		    });
		    it("should be able to import no scripts",function (done){
			    self.imported=false;
			    single(function(a){importScripts();return a;}, 9).then(function (a) { assert.equal(a,9); }).then(done, done);
		    });
		    it("should be able to import scripts in a sticks around",function (done){
			    self.imported=false;
			    function wrapUp(){
				    comrade.close();
				    done();
			    }
			    var comrade = cw(function(a){importScripts('fakeLib.js');return a;});
			    comrade.data(9).then(function (a) { assert.equal(a,9); }).then(wrapUp, wrapUp);
		    });
		    it("should be able to import scripts in a sticks around and call it twice",function (done){
			    self.imported=false;
			    function wrapUp(){
				    comrade.close();
				    done();
			    }
			    var comrade = cw(function(a){importScripts('fakeLib.js');return a;});
			    comrade.data(9).then(function (a) { assert.equal(a,9); 
			    comrade.data(7).then(function(aa){assert.equal(aa,7)}).then(wrapUp,wrapUp);
			    });
		    });
            it("should be able to import scripts in an object function",function (done){
            	self.imported=false;
            	function wrapUp(){
				    comrade.close();
				    done();
			    }
        		var comrade = cw({data:function(a){importScripts('fakeLib.js');return a;}});
			    comrade.data(9).then(function (a) { assert.equal(a,9); }).then(wrapUp, wrapUp);
		    });
	    });
	    describe('Objects', function () {
		    var comrade;
		    it("should be able create an object worker",function (done){
			    comrade = cw({product:product,aSquare:aSquare,square:square});
			    comrade.aSquare(3).then(function(a){
				    assert.equal(a,9);
			    }).then(function(){
				    return comrade.product([20,100]);
			    }).then(function(a){assert.equal(a,2000)}).then(function(){
				    return comrade.square(5);
			    }).then(function(a){assert.equal(a,25)}).then(done,done);
		    });
		    it("and catch an error in it",function (done){
			    comrade.square("explode").then(function(){},function(a){assert.include(a,"explode");}).then(done,done);
		    });
		    it("and then do more stuff",function (done){
			    comrade.square("explode").then(function(){},function(a){assert.include(a,"explode");
			    comrade.square(9).then(function(a){assert.equal(a,81)}).then(done,done);
			    });
		    });
		    it("and close it",function (done){
			    comrade.close().then(done,done);
		    });
		    it("should work with an initializer function",function (done){
			    function wrapUp(){
				    comrade.close().then(done,done);
			    }
			    var comrade = cw({initialize:function(){this.a=7},test:function(){return this.a}});
			    comrade.test().then(function(a){assert.equal(a,7)}).then(wrapUp,wrapUp);
		    });
	    });
	    describe('Queues', function () {
		    var comrade;
		    it("should be able create an object worker",function (done){
			    comrade = cw({product:product,aSquare:aSquare,square:square},2);
			    comrade.aSquare(3).then(function(a){
				    assert.equal(a,9);
			    }).then(function(){
				    return comrade.product([20,100]);
			    }).then(function(a){assert.equal(a,2000)}).then(function(){
				    return comrade.square(5);
			    }).then(function(a){assert.equal(a,25)}).then(function(){done()},function(){done()});
		    });
		    it("and catch an error in it",function (done){
			    comrade.square("explode").then(function(){},function(a){assert.include(a,"explode");;}).then(done,done);
		    });
		    it("and then do more stuff",function (done){
			    comrade.square("explode").then(function(){},function(a){assert.include(a,"explode");
			    comrade.square(9).then(function(a){assert.equal(a,81)}).then(done,done);
			    });
		    });
		    it("should work batch with a callback",function (done){
			    var i = 4;
			    var tot = 0;
		    comrade.batch(function(a){
				    i--;
				    tot+=a;
				    if(!i){
					    assert.equal(tot,120);
					    done();
				    }
			    })
				    .square([2,4,6,8]);
		    });
		    it("should work batch",function (done){
			    comrade.batch
				    .square([2,4,6,8])
				    .then(function(a){
					    assert.equal(a.reduce(function(b,c){return b+c;}),120);
				    }
			    ).then(function(){done()},function(){done()});
		    });
		    it("should work if batch has an error",function (done){

			    comrade.batch
				    .square([2,4,6,8,'explode'])
				    .then(
					    function(){},
					    function(a){
					    assert.include(a,"explode");
					    }
				    ).then(function(){done()},function(){done()});
		    });
		    it("and close it",function (done){
			    comrade.close().then(function(){done()},function(){done()});
		    });
		    it("should work with an initializer function",function (done){
			    function wrapUp(){
				    comrade.close().then(function(){done()},function(){done()});
			    }
			    var comrade = cw({initialize:function(){this.a=7},test:function(){return this.a}});
			    comrade.test().then(function(a){assert.equal(a,7)}).then(wrapUp,wrapUp);
		    });
		    it("cancel it",function (done){
			    var worker = cw({
				    waitForever:function(num,cb){
					    setTimeout(function(){
						    cb(num)
					    },2000)
				    }
			    },3);
			    worker.batch.waitForever([1,2,3,4,5,6,7,8]).then(done,function(a){
				    assert.equal(a,'no');
				    worker.close().then(function(){done()},function(){done()});
			    });
			    worker.batch('no');
		    });
		    it("cancel it not batch",function (done){
			    var worker = cw({waitForever:function(num,cb){setTimeout(function(){cb(num)},200)}},2);
			    var yes = 0;
			    var no = 0;
			    var next = function(yes,no){
				    if((yes+no)===8){
						    assert(no>1);
						    worker.close().then(function(){done()},function(){done()});
					    }
			    };
			    var ar = [1,2,3,4,5,6,7,8];
			    ar.forEach(function(a){
				    worker.waitForever(a).then(function(v){
					    yes++;
					    worker.batch('no');
					    next(yes,no);
				    },function(v){
					    no++;
					    next(yes,no);
				    });
			    });
		    });
		    it('should work when things are canceled',function(done){
			    var comrade = cw({data:function(data,cb){
				    setTimeout(function(){cb('done');},500);
			    }},2);
			    var i = 0;
			    var onEach = function(){
				    i++;
				    if(i>4){
					    comrade.close();
					    done();
				    }
			    };
			    comrade.data('whatever').then(onEach,onEach);
			    var a = comrade.data('whatever');
			    a.then(onEach,onEach);
			    comrade.data('whatever').then(onEach,onEach);
			    var b = comrade.data('whatever');
			    b.then(onEach,onEach);
			    comrade.data('whatever').then(onEach,onEach);
			    a.cancel();
			    b.cancel();
		    });
	    });
	    if(typeof global !== 'undefined'){
	        describe('no conflict', function () {
		        it('no conflict should work',function(){
			        cw.noConflict();
			        assert.equal(global.cw,"cw");
		        });
		        it('should be able to put it back',function(){
			        catiline.noConflict('cw');
			        assert.equal(global.cw,global.catiline);
		        });
	        });
	    }
	    describe('dumb Queues', function () {
		    var comrade;
		    var catiline = global?global.catiline:cw;
		    it("should be able create an object worker",function (done){
			    comrade = catiline({product:product,aSquare:aSquare,square:square},2,"dumb");
			    comrade.aSquare(3).then(function(a){
				    assert.equal(a,9);
			    }).then(function(){
				    return comrade.product([20,100]);
			    }).then(function(a){assert.equal(a,2000)}).then(function(){
				    return comrade.square(5);
			    }).then(function(a){assert.equal(a,25)}).then(done,done);
		    });
		    it("and catch an error in it",function (done){
			    comrade.square("explode").then(function(){},function(a){assert.include(a,"explode");}).then(done,done);
		    });
		    it("and then do more stuff",function (done){
			    comrade.square("explode").then(function(){},function(a){assert.include(a,"explode");
			    comrade.square(9).then(function(a){assert.equal(a,81)}).then(done,done);
			    });
		    });
		    it("and close it",function (done){
			    comrade._close().then(function(){done()},function(){done()});
		    });
		    it("should work batch",function (done){
			    function wrapUp(){
				    comrade.close().then(function(){done()},function(){done()});
			    }
			    var comrade = catiline({product:product,aSquare:aSquare,square:square},2,"dumb");
			    comrade.batch
				    .square([2,4,6,8])
				    .then(function(a){
					    assert.equal(a.reduce(function(b,c){return b+c;}),120);
				    }
			    ).then(wrapUp,wrapUp);
		    });
	    it("should work if batch has an error",function (done){
		    function wrapUp(){
				    comrade.close().then(function(){done()},function(){done()});
			    }
			    var comrade = catiline({product:product,aSquare:aSquare,square:square},2,"dumb");
			    comrade.batch
				    .square([2,4,6,8,'explode'])
				    .then(
					    function(){},
					    function(a){
					    assert.include(a,"explode");
					    }
				    ).then(wrapUp,wrapUp);
		    });
		    it("should work batch with a callback",function (done){
			    function wrapUp(){
				    comrade.close().then(function(){done()},function(){done()});
			    }
			    var i = 4;
			    var tot = 0;
			    var comrade = catiline({product:product,aSquare:aSquare,square:square},2,"dumb"
		    );
		    comrade.batch(function(a){
				    i--;
				    tot+=a;
				    if(!i){
					    assert.equal(tot,120);
					    wrapUp();
				    }
			    })
				    .square([2,4,6,8]);
		    });
		    it("should work with an initializer function",function (done){
			    function wrapUp(){
				    comrade.close().then(function(){done()},function(){done()});
			    }
			    var comrade=catiline({initialize:function(){this.a=7},test:function(){return this.a}},2,"dumb");
			    comrade.test().then(function(a){assert.equal(a,7)}).then(wrapUp);
		    });
		    it('should work when things are canceled',function(done){
			    var comrade = cw({data:function(data,cb){
				    setTimeout(function(){cb('done');},500);
			    }},2,true);
			    var i = 0;
			    var onEach = function(){
				    i++;
				    if(i>4){
					    comrade.close();
					    done();
				    }
			    };
			    comrade.data('whatever').then(onEach,onEach);
			    var a = comrade.data('whatever');
			    a.then(onEach,onEach);
			    comrade.data('whatever').then(onEach,onEach);
			    var b = comrade.data('whatever');
			    b.then(onEach,onEach);
			    comrade.data('whatever').then(onEach,onEach);
			    a.cancel();
			    b.cancel();
		    });
	    });
	    describe('Basic Pub-Sub', function () {
		    var comrade = cw({
			    init:function(){
				    function double (a){
					    this.fire('doubled',a<<1);
					    this.off('double');
				    }
				    this.on('multi',function(){
					    this.fire('d1');
					    this.fire('d2');
				    });
				    this.on('quad',function(b){
					    this.fire('q',b<<2);
				    });
				    this.on('double',double);
			    },two:function(a,callback,scope){
				    scope.fire('take1 take2',a);
				    return true;
			    },empty:function(a){
				    this.fire(a);
				    return true;
			    }
		    });
		    it('should work',function(done){
			    comrade.on('doubled',function(a){
				    assert.equal(a,42);
				    done();
			    });
			    comrade.fire('double',21);
		    });
		    it('should work double',function(done){
			    var count = 0;
			    comrade.on('d1 d2',function(){
				    count++;
				    if(count === 2){
					    comrade.off('d1 d2');
				    }
				    if(count > 1){
					    done();
					    comrade.fire('multi');
				    }
			    });
			    comrade.fire('multi');
		    });
		    it('should be able to fire multi events',function(done){
			    var count = 0;
			    var times = 0;
			    function wrapup(){
				    if(times === 2){
					    assert.equal(count,15);
					    done();
				    }
			    }
			    comrade.on('take1',function(a){
				    count += a;
				    times++;
				    wrapup();
			    });
			    comrade.on('take2',function(a){
				    count += (a*2);
				    times++;
				    wrapup();
			    });
			    comrade.two(5);
		    });
		    it('should be able to fire an empty event',function(done){
			    comrade.on('pancake',done);
			    comrade.empty('pancake');
		    });
		    it('and put it out',function(done){
			    comrade.on('q',function(a){
				    assert.equal(a,8);
				    comrade.close();
				    done();
			    });
			    comrade.fire('double',21);
			    comrade.fire('quad',2);
		    });
		    it('should be able to remove an event by name',function(done){
		        var comrade = cw({
			        init:function(){
			            this.on('hey',function(data,self){
			                self.fire('heyYourself',data);
			            });
			        }});
		        var getsCalled = function (data){
		            assert.equal(data,'how are you');
		            comrade.close();
		            done();
		        }
		        var dontGetCalled = function(data){
		            done('bad');
		        }
		        comrade.on('heyYourself',getsCalled);
		        comrade.on('heyYourself',dontGetCalled);
		        comrade.off('heyYourself',dontGetCalled);
		        comrade.fire('hey','how are you');
		    });
		    it('should be able to remove an event by name the otherway',function(done){
		        var comrade = cw({
			        init:function(){
			            function h1(data,self){
			                self.fire('hey1',data);
			            }
			            function h2(data,self){
			                self.fire('hey2',data);
			            }
			            this.on('hey', h1);
			            this.on('hey', h2);
			            this.off('hey', h2);
			        }});
		        var getsCalled = function (data){
		            assert.equal(data,'how are you');
		            comrade.close();
		            done();
		        }
		        var dontGetCalled = function(data){
		            done('bad');
		        }
		        comrade.on('hey1',getsCalled);
		        comrade.on('hey2',dontGetCalled);
		        comrade.fire('hey','how are you');
		    });
		    it('should be able to run a one off event',function(done){
		        var comrade = cw({
			        init:function(){
			            var a = 1;
			            this.on('notTwice',function(things,self){
			                self.fire('YOLO',a++);
			            });
			        }
			    });
			    var i = 1;
			    comrade.on('YOLO',function(a){
				    assert.equal(a,i++);
				    if(i===3){
				    	done();
				    	setTimeout(function() {
				    		comrade.close();
				    	}, 5);
				    }
			    });
			    comrade.one('YOLO',function(a){
				    assert.equal(a,1);
			    });
			    comrade.fire('notTwice');
			    comrade.fire('notTwice');
		    });
		    it('should be able to run a one off event in the worker',function(done){
		        var comrade = cw({
			        init:function(){
			            var a = 1;
			            this.one('notTwice',function(things,self){
			                self.fire('YOLO',a++);
			            });
			            
			        }, events:{
			    		notTwice:function(things,self){
			            	self.fire('check',self.b);
			                if(self.b++===2){
			                	self.fire('closeWorker');
			                }
			            }
			    	},
			    	b:1,
			    	listners:{
			    		closeWorker:function(a){
				    		this.close();
				    		done();
			    		}
			    	}
			    });
			    var i = 1;
			    comrade.on('YOLO',function(a){
				    assert.equal(a,1);
			    });
			    comrade.on('check',function(a){
				    assert.equal(a,i++);
			    });
			    comrade.fire('notTwice');
			    comrade.fire('notTwice');
		    });
	    });
	    if(typeof console !== 'undefined'){
	        describe('console', function () {
	        	it('console.log should work',function(done){
	        		var comrade = cw({init:function(){
	        			console.log(1234,"hello");
	        		},listners:{
	        			console:function(d){
	        				assert.deepEqual(d,["log",[1234,"hello"]]);
	        				comrade.close();
	        				done();
	        			}
	        		}});
	        	});
	        	it('console.debug should work',function(done){
	        		var comrade = cw({init:function(){
	        			console.debug(1234,"hello");
	        		},listners:{
	        			console:function(d){
	        				assert.deepEqual(d,["debug",[1234,"hello"]]);
	        				comrade.close();
	        				done();
	        			}
	        		}});
	        	});
	        	it('console.error should work',function(done){
	        		var comrade = cw({init:function(){
	        			console.error(1234,"hello");
	        		},listners:{
	        			console:function(d){
	        				assert.deepEqual(d,["error",[1234,"hello"]]);
	        				comrade.close();
	        				done();
	        			}
	        		}});
	        	});
	        	it('console.info should work',function(done){
	        		var comrade = cw({init:function(){
	        			console.info(1234,"hello");
	        		},listners:{
	        			console:function(d){
	        				assert.deepEqual(d,["info",[1234,"hello"]]);
	        				comrade.close();
	        				done();
	        			}
	        		}});
	        	});
	        	it('console.warn should work',function(done){
	        		var comrade = cw({init:function(){
	        			console.warn(1234,"hello");
	        		},listners:{
	        			console:function(d){
	        				assert.deepEqual(d,["warn",[1234,"hello"]]);
	        				comrade.close();
	        				done();
	        			}
	        		}});
	        	});
	        	it('console.time should work',function(done){
	        		var comrade = cw({init:function(){
	        			console.time(1234,"hello");
	        		},listners:{
	        			console:function(d){
	        				assert.deepEqual(d,["time",[1234,"hello"]]);
	        				comrade.close();
	        				done();
	        			}
	        		}});
	        	});
	        	it('console.timeEnd should work',function(done){
	        		var comrade = cw({init:function(){
	        			console.timeEnd(1234,"hello");
	        		},listners:{
	        			console:function(d){
	        				assert.deepEqual(d,["timeEnd",[1234,"hello"]]);
	        				comrade.close();
	        				done();
	        			}
	        		}});
	        	});
	        });
	    }
    });
}
