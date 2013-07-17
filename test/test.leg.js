mocha.setup({
    ui: "bdd",
    globals: ["console"],
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
var fakeLegacy = true;
//cw.URL=true;
describe('cw()', function () {
	describe('Basic', function () {
		it('should work when given a function and data directly', function (done) {
			cw(square, 9).then(function (a) {
				assert.equal(a,81,'are equel');
			}).then(done, done);
		});
		it('should work when given a function and data async', function (done) {
			cw(aSquare, 9).then(function (a) {
				assert.equal(a,81,'are equel');
			}).then(done, done);
		});
		it('should allow chaining of data functions, with callback passed to cw()', function (done) {
			var count = 0;
			var comrade = cw(square, function (a) {
				count++; assert.equal(a,81,'are equel');
				if (count === 2) {
					done();
				}
			});
			comrade.data(9).data(9);
		});
		it('should allow chaining of data functions, with callback passed to cw() async', function (done) {
			var count = 0;
			var comrade = cw(aSquare, function (a){
				count++; assert.equal(a,81,'are equel');
				if (count === 2) {
					done();
				}
			});
			comrade.data(9).data(9);
		});
	});
	describe('errors', function () {
		it('should gracefully handle an error', function (done) {
			var count = 0;
			var comrade = cw(square,function(a){
				assert.equal(a,100,'are equel');
				afterEach(a);
			},function(a){
				a.preventDefault();
				assert.include(a.messege,"blah",'should be an error');
				afterEach(a);
			});
			function afterEach(a){
				count++;
				if(count === 3){
					done();
				}
			}
			comrade.data(10).data("blah blah").data(10);
		});
		it('should gracefully handle an error in a sticksaround', function (done) {
			function wrapUp(){
				comrade.close();
				done();
			}
			var comrade = cw(square);
			comrade.data("Ermahgerd").then(function(a){a.should.be.an('undefined');},function(a){assert.include(a.message,"Ermahgerd",'should be an error');}).then(wrapUp, wrapUp);
		});
		it('should gracefully handle an error as a oneoff', function (done) {
			cw(square,"Ermahgerd").then(function(a){a.should.be.an('undefined');},function(a){assert.include(a.message,"Ermahgerd",'should be an error');}).then(done, done);
		});
	});
	describe('Worker reuse', function () {
		
		it('should work with callback applied to promise', function (done) {
			function wrapUp(){
				comrade.close();
				done();
			}
			var comrade = cw(square)
			comrade.data(9).then(function (a) { assert.equal(a,81,'are equel'); 
			comrade.data(62).then(function (a) {assert.equal(a,3844,'are equel'); }).then(wrapUp, wrapUp);
			});
		});
		it('should work with callback applied to promise async', function (done) {
			function wrapUp(){
				comrade.close();
				done();
			}
			var comrade = cw(aSquare)
			comrade.data(9).then(function (a) {  assert.equal(a,81,'are equel'); 
			comrade.data(62).then(function (a) { assert.equal(a,3844,'are equel'); }).then(wrapUp, wrapUp);
			});
		});

		it('should work with callback passed to cw()', function (done) {
			var count = 0;
			var comrade = cw(square, function (a) { count++; assert.equal(a,81,'are equel'); if (count === 2) { comrade.close();done(); } });
			comrade.data(9);
			comrade.data(9);
		});
			it('should work with callback passed to cw() async', function (done) {
			var count = 0;
			var comrade = cw(aSquare, function (a) { count++;assert.equal(a,81,'are equel'); if (count === 2) {comrade.close();done(); } });
			comrade.data(9);
			comrade.data(9);
		});
	});
	describe('MapReduce', function () {
		it('should work', function (done) {
			var comrade = cw(1, true);
			comrade.data([1,2,3]);
			comrade.map(square);
			comrade.reduce(sum).then(function (a) { assert.equal(a,14); }).then(done, done);
		});
		it('should work with chaining syntax', function (done) {
		    cw(1, true)
		        .data([1,2,3])
		        .map(aSquare)
		        .reduce(sum)
		        .then(function (a) { assert.equal(a,14); }).then(done, done);
		});
	});
	describe('MapReduce incremental', function () {
		it('should work', function (done) {
			var comrade = cw(1);
			comrade.data([1,2,3]);
			comrade.map(square);
			comrade.reduce(sum);
			comrade.close().then(function (a) { assert.equal(a,14); }).then(done, done);
		});
		it('should work if we add more data', function (done) {
			var comrade = cw(1);
			comrade.data([1,2,3]);
			comrade.map(square);
			comrade.reduce(sum);
			comrade.fetch().then(function (a) { assert.equal(a,14); });
			comrade.data([4,5,6]);
			comrade.close().then(function (a) { assert.equal(a,91); }).then(done, done);
		});
		it('should work with chaining syntax', function (done) {
		    cw(1)
		        .data([1,2,3])
		        .map(square)
		        .reduce(sum)
		        .close().then(function (a) { assert.equal(a,14); }).then(done, done);
		});
		it('should work with chaining syntax and more data', function (done) {
		    cw(1)
		        .data([1,2,3])
		        .map(square)
		        .data([4,5,6])
		        .reduce(sum)
		        .close().then(function (a) { assert.equal(a,91); }).then(done, done);
		});
		it('should work with chaining syntax, more data, and more workers', function (done) {
		    cw(3)
		        .data([1,2,3])
		        .map(square)
		        .data([4,5,6])
		        .reduce(sum)
		        .close().then(function (a) {  assert.equal(a,91); }).then(done, done);
		});
	});

	
	describe('Objects', function () {
		var comrade = cw({product:product,aSquare:aSquare,square:square});
		it("should be able create an object worker",function (done){
			comrade.aSquare(3).then(function(a){
				assert.equal(a,9,'are equal');
			}).then(function(){
				return comrade.product([20,100]);
			}).then(function(a){assert.equal(a,2000,'are equal');}).then(function(){
				return comrade.square(5);
			}).then(function(a){assert.equal(a,25,'are equal');}).then(done,done);
		});
		it("and catch an error in it",function (done){
			comrade.square("explode").then(function(){},function(a){assert.include(a,"explode",'should be an error');}).then(done,done);
		});
		it("and then do more stuff",function (done){
			comrade.square("explode").then(function(){},function(a){assert.include(a,"explode",'should be an error');
			comrade.square(9).then(function(a){assert.equal(a,81,'are equal');}).then(done,done);
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
			comrade.test().then(function(a){assert.equal(a,7,'are equal');}).then(wrapUp,wrapUp);
		});
	});
	describe('Queues', function () {
		var comrade = cw({product:product,aSquare:aSquare,square:square},2);
		it("should be able create an object worker",function (done){
			comrade.aSquare(3).then(function(a){
				assert.equal(a,9,'are equal');
			}).then(function(){
				return comrade.product([20,100]);
			}).then(function(a){assert.equal(a,2000,'are equal');}).then(function(){
				return comrade.square(5);
			}).then(function(a){assert.equal(a,25,'are equal');}).then(done,done);
		});
		it("and catch an error in it",function (done){
			comrade.square("explode").then(function(){},function(a){assert.include(a,"explode",'should be an error');}).then(done,done);
		});
		it("and then do more stuff",function (done){
			comrade.square("explode").then(function(){},function(a){assert.include(a,"explode",'should be an error');
			comrade.square(9).then(function(a){assert.equal(a,81,'are equal');}).then(done,done);
			});
		});
		it("should work batch with a callback",function (done){
			var i = 4;
			var tot = 0;
		comrade.batch(function(a){
				i--;
				tot+=a;
				if(!i){
					assert.equal(tot,120,'are equal');
					done();
				}
			})
				.square([2,4,6,8]);
		});
		it("should work batch",function (done){
			comrade.batch
				.square([2,4,6,8])
				.then(function(a){
				assert.equal(a.reduce(function(b,c){return b+c;}),120,'are equal');	
				}
			).then(done,done);
		});
		it("should work if batch has an error",function (done){

			comrade.batch
				.square([2,4,6,8,'explode'])
				.then(
					function(){},
					function(a){
					assert.include(a,"explode",'should be an error');
					}
				).then(done,done);
		});
		it("and close it",function (done){
			comrade.close().then(function(){done()},function(){done()});
		});
		it("should work with an initializer function",function (done){
			function wrapUp(){
				comrade.close().then(done,done);
			}
			var comrade = cw({initialize:function(){this.a=7},test:function(){return this.a}});
			comrade.test().then(function(a){assert.equal(a,7,'equel')}).then(wrapUp,wrapUp);
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
	describe('Dumb Queues', function () {
		var comrade = communist({product:product,aSquare:aSquare,square:square},2,'dumb');
		it("should be able create an object worker",function (done){
			comrade.aSquare(3).then(function(a){
				assert.equal(a,9,'are equal');
			}).then(function(){
				return comrade.product([20,100]);
			}).then(function(a){assert.equal(a,2000,'are equal');}).then(function(){
				return comrade.square(5);
			}).then(function(a){assert.equal(a,25,'are equal');}).then(done,done);
		});
		it("and catch an error in it",function (done){
			comrade.square("explode").then(function(){},function(a){assert.include(a,"explode",'should be an error');}).then(done,done);
		});
		it("and then do more stuff",function (done){
			comrade.square("explode").then(function(){},function(a){assert.include(a,"explode",'should be an error');
			comrade.square(9).then(function(a){assert.equal(a,81,'are equal');}).then(done,done);
			});
		});
		it("should work batch with a callback",function (done){
			var i = 4;
			var tot = 0;
		comrade.batch(function(a){
				i--;
				tot+=a;
				if(!i){
					assert.equal(tot,120,'are equal');
					done();
				}
			})
				.square([2,4,6,8]);
		});
		it("should work batch",function (done){
			comrade.batch
				.square([2,4,6,8])
				.then(function(a){
				assert.equal(a.reduce(function(b,c){return b+c;}),120,'are equal');	
				}
			).then(done,done);
		});
		it("should work if batch has an error",function (done){

			comrade.batch
				.square([2,4,6,8,'explode'])
				.then(
					function(){},
					function(a){
					assert.include(a,"explode",'should be an error');
					}
				).then(done,done);
		});
		it("and close it",function (done){
			comrade.close().then(function(){done()},function(){done()});
		});
		it("should work with an initializer function",function (done){
			function wrapUp(){
				comrade.close().then(done,done);
			}
			var comrade = communist({initialize:function(){this.a=7},test:function(){return this.a}},'dumb');
			comrade.test().then(function(a){assert.equal(a,7,'equel')}).then(wrapUp,wrapUp);
		});
	});
	describe('Basic Pub-Sub', function () {
		var comrade = communist({
			init:function(){
				function double (a){
					this.off('double');
					this.fire('doubled',a<<1);
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
				assert.equal(a, 42);
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
				done();
				comrade.close();
			});
			comrade.fire('double',21);
			comrade.fire('quad',2);
		});
	});

	describe('Import Scripts', function () {
		it("should be able to import scripts",function (done){
			self.imported=false;
			cw(function(a){importScripts('fakeLib.js');return a;}, 9).then(function (a) { assert.equal(a,9); }).then(done, done);
		});
		it("should be able to import scripts with a space in it",function (done){
			cw(function(a){importScripts( 'fakeLib.js' );return a;}, 9).then(function (a) { assert.equal(a,9); }).then(done, done);
		});
		it("should be able to import scripts with double quotes",function (done){
			self.imported=false;
			cw(function(a){importScripts("fakeLib.js");return a;}, 9).then(function (a) { assert.equal(a,9); }).then(function(){done()}, function(){done()});
		});
		it("should be able to import reletive urls",function (done){
			self.imported=false;
			cw(function(a){importScripts('../test/fakeLib.js');return a;}, 9).then(function (a) { assert.equal(a,9); }).then(function(){done()}, function(){done()});
		});
		it("should be able to import 2 scripts",function (done){
			self.imported=false;
			cw(function(a){importScripts("fakeLib.js",'../test/fakerLib.js');return a;}, 9).then(function () {},function(a){assert.include(a,"tried to import twice");}).then(function(){done()}, function(){done()});
		});
		it("should be able to import 2 scripts that are teh same",function (done){
			self.imported=false;
			cw(function(a){importScripts("fakeLib.js",'../test/fakeLib.js');return a;}, 9).then(function () {},function(a){assert.include(a,"tried to import twice");}).then(function(){done()}, function(){done()});
		});
		it("should be able to import 2 scripts in two import scripts",function (done){
			self.imported=false;
			cw(function(a){importScripts("fakeLib.js");importScripts('../test/fakerLib.js');return a;}, 9).then(function () {},function(a){assert.include(a,"tried to import twice");}).then(function(){done()}, function(){done()});
		});
		it("should be able to import no scripts",function (done){
			self.imported=false;
			cw(function(a){importScripts();return a;}, 9).then(function (a) { assert.equal(a,9); }).then(done, done);
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
			comrade.data(7).then(function(aa){assert.equal(aa,7);}).then(wrapUp,wrapUp);
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
});
