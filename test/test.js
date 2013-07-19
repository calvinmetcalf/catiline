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
//cw.URL=true;
describe('cw()', function () {
	describe('Basic', function () {
		it('should work when given a function and data directly', function (done) {
			cw.single(square, 9).then(function (a) { assert.equal(a,81); }).then(done, done);
		});
		it('should work when given a function and data async', function (done) {
			cw.single(aSquare, 9).then(function (a) { assert.equal(a,81); }).then(done, done);
		});
		
		it('should be able to handle an array buffer', function(done){
			if(typeof Uint8Array === 'undefined'||typeof fakeLegacy!== 'undefined'){
				done();
				return;
			}
			function wrapUp(){
				comrade.close();
				done();
			}
			var comrade = cw(function(data,cb){cb(data)});
			comrade.data((new Uint8Array([1,2,3,4,5,6,7,8])).buffer).then(function(a){assert.equal(a.byteLength,8)}).then(wrapUp,wrapUp);
		});
		it('should be able to handle an array buffer as a transferable object', function(done){
			if(typeof Uint8Array === 'undefined'||typeof fakeLegacy!== 'undefined'){
				done();
				return;
			}
			function wrapUp(){
				comrade.close();
				done();
			}
			var comrade = cw(function(data,cb){cb(data,[data])});
			comrade.data(buf,[buf]).then(function(a){assert.equal(a.byteLength,8)}).then(wrapUp,wrapUp);
		});
		
	});undefined
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
			cw.single(square,"Ermahgerd").then(function(a){a.should.be.an('undefined');},function(a){assert.isString(a);}).then(done, done);
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
			cw.single(function(a){importScripts('fakeLib.js');return a;}, 9).then(function (a) { assert.equal(a,9); }).then(done, done);
		});
		it("should be able to import scripts with a space in it",function (done){
			self.imported=false;
			cw.single(function(a){importScripts( 'fakeLib.js' );return a;}, 9).then(function (a) { assert.equal(a,9); }).then(done, done);
		});
		it("should be able to import scripts with double quotes",function (done){
			self.imported=false;
			cw.single(function(a){importScripts("fakeLib.js");return a;}, 9).then(function (a) { assert.equal(a,9); }).then(done, done);
		});
		it("should be able to import reletive urls",function (done){
			self.imported=false;
			cw.single(function(a){importScripts('../test/fakeLib.js');return a;}, 9).then(function (a) { assert.equal(a,9); }).then(done, done);
		});
		it("should be able to import 2 scripts",function (done){
			self.imported=false;
			cw.single(function(a){importScripts("fakeLib.js",'../test/fakerLib.js');return a;}, 9).then(function () {},function(a){assert.include(a,"tried to import twice")}).then(done, done);
		});
		it("should be able to import 2 scripts that are the same",function (done){
			self.imported=false;
			cw.single(function(a){importScripts("fakeLib.js",'../test/fakeLib.js');return a;}, 9).then(function () {},function(a){assert.include(a,"tried to import twice")}).then(done, done);
		});
		it("should be able to import 2 scripts in two import scripts",function (done){
			self.imported=false;
			cw.single(function(a){importScripts("fakeLib.js");importScripts('../test/fakerLib.js');return a;}, 9).then(function () {},function(a){assert.include(a,"tried to import twice")}).then(done, done);
		});
		it("should be able to import no scripts",function (done){
			self.imported=false;
			cw.single(function(a){importScripts();return a;}, 9).then(function (a) { assert.equal(a,9); }).then(done, done);
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
		var comrade = cw({product:product,aSquare:aSquare,square:square});
		it("should be able create an object worker",function (done){
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
		var comrade = cw({product:product,aSquare:aSquare,square:square},2);
		it("should be able create an object worker",function (done){
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
	});
	describe('no conflict', function () {
		it('no conflict should work',function(){
			cw.noConflict();
			assert.equal(cw,"cw");
		});
		it('should be able to put it back',function(){
			communist.noConflict('cw');
			assert.equal(cw,communist);
		});
	});
	describe('dumb Queues', function () {
		var comrade = communist({product:product,aSquare:aSquare,square:square},2,"dumb");
		it("should be able create an object worker",function (done){
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
			var comrade = communist({product:product,aSquare:aSquare,square:square},2,"dumb");
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
			var comrade = communist({product:product,aSquare:aSquare,square:square},2,"dumb");
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
			var comrade = communist({product:product,aSquare:aSquare,square:square},2,"dumb"
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
			var comrade=communist({initialize:function(){this.a=7},test:function(){return this.a}},2,"dumb");
			comrade.test().then(function(a){assert.equal(a,7)}).then(wrapUp);
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
		it('and put it out',function(done){
			comrade.on('q',function(a){
				assert.equal(a,8);
				comrade.close();
				done();
			});
			comrade.fire('double',21);
			comrade.fire('quad',2);
		});
		
	});
});
