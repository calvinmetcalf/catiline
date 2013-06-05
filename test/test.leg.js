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

//communist.URL=true;
describe('communist()', function () {
	describe('Basic', function () {
		it('should work when given a function and data directly', function (done) {
			communist(square, 9).then(function (a) { assert.equal(a,81,'are equel'); }).then(done, done);
		});
		it('should work when given a function and data async', function (done) {
			communist(aSquare, 9).then(function (a) { assert.equal(a,81,'are equel'); }).then(done, done);
		});
		it('should allow chaining of data functions, with callback passed to communist()', function (done) {
			var count = 0;
			var comrade = communist(square, function (a) { count++; assert.equal(a,81,'are equel'); if (count === 2) { comrade.close();done(); } });
			comrade.data(9).data(9);
		});
		it('should allow chaining of data functions, with callback passed to communist() async', function (done) {
			var count = 0;
			var comrade = communist(aSquare, function (a) { count++; assert.equal(a,81,'are equel'); if (count === 2) { done(); } });
			comrade.data(9).data(9);
		});
	});
	describe('errors', function () {
		it('should gracefully handle an error', function (done) {
			var count = 0;
			var comrade = communist(square,function(a){
				assert.equal(a,100,'are equel');
				afterEach();
			},function(a){
				a.preventDefault();
				assert.include(a,"Ermahgerd",'should be an error');
				afterEach();
			});
			function afterEach(){
				count++;
				if(count === 3){
					comrade.close();
					done();
				}
			}
			comrade.data(10).data("Ermahgerd").data(10);
		});
		it('should gracefully handle an error in a sticksaround', function (done) {
			function wrapUp(){
				comrade.close();
				done();
			}
			var comrade = communist(square);
			comrade.data("Ermahgerd").then(function(a){a.should.be.an('undefined');},function(a){assert.include(a,"Ermahgerd",'should be an error');}).then(wrapUp, wrapUp);
		});
		it('should gracefully handle an error as a oneoff', function (done) {
			communist(square,"Ermahgerd").then(function(a){a.should.be.an('undefined');},function(a){assert.include(a,"Ermahgerd",'should be an error');}).then(done, done);
		});
	});
	describe('Worker reuse', function () {
		
		it('should work with callback applied to promise', function (done) {
			function wrapUp(){
				comrade.close();
				done();
			}
			var comrade = communist(square)
			comrade.data(9).then(function (a) { assert.equal(a,81,'are equel'); 
			comrade.data(62).then(function (a) {assert.equal(a,3844,'are equel'); }).then(wrapUp, wrapUp);
			});
		});
		it('should work with callback applied to promise async', function (done) {
			function wrapUp(){
				comrade.close();
				done();
			}
			var comrade = communist(aSquare)
			comrade.data(9).then(function (a) {  assert.equal(a,81,'are equel'); 
			comrade.data(62).then(function (a) { assert.equal(a,3844,'are equel'); }).then(wrapUp, wrapUp);
			});
		});
		it('should work with callback passed to communist()', function (done) {
			var count = 0;
			var comrade = communist(square, function (a) { count++; assert.equal(a,81,'are equel'); if (count === 2) { comrade.close();done(); } });
			comrade.data(9);
			comrade.data(9);
		});
		it('should work with callback passed to communist() async', function (done) {
			var count = 0;
			var comrade = communist(aSquare, function (a) { count++;assert.equal(a,81,'are equel'); if (count === 2) { comrade.close();done(); } });
			comrade.data(9);
			comrade.data(9);
		});
	});


	
	describe('Objects', function () {
		var comrade = communist({product:product,aSquare:aSquare,square:square});
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
			var comrade = communist({initialize:function(){this.a=7},test:function(){return this.a}});
			comrade.test().then(function(a){assert.equal(a,7,'are equal');}).then(wrapUp,wrapUp);
		});
	});
	describe('Queues', function () {
		var comrade = communist({product:product,aSquare:aSquare,square:square},2);
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
			comrade.close().then(done,done);
		});
		it("should work with an initializer function",function (done){
			function wrapUp(){
				comrade.close().then(done,done);
			}
			var comrade = communist({initialize:function(){this.a=7},test:function(){return this.a}});
			comrade.test().then(function(a){assert.equal(a,7,'equel')}).then(wrapUp,wrapUp);
		});
	});
});
