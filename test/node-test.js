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
var chai = require("chai");
chai.should();
var communist = require("communist");
describe('communist()', function () {
	describe('Basic', function () {
		it('should work when given a function and data directly', function (done) {
			communist(square, 9).then(function (a) { a.should.equal(81); }).then(done, done);
		});
		it('should work when given a function and data async', function (done) {
			communist(aSquare, 9).then(function (a) { a.should.equal(81); }).then(done, done);
		});
		it('should allow chaining of data functions, with callback passed to communist()', function (done) {
			var count = 0;
			var comrade = communist(square, function (a) { count++; a.should.equal(81); if (count === 2) { done(); } });
			comrade.data(9).data(9);
		});
		it('should allow chaining of data functions, with callback passed to communist() async', function (done) {
			var count = 0;
			var comrade = communist(aSquare, function (a) { count++; a.should.equal(81); if (count === 2) { done(); } });
			comrade.data(9).data(9);
		});
	});
	describe('errors', function () {
		it('should gracefully handle an error', function (done) {
			var count = 0;
			var comrade = communist(square,function(a){
				a.should.equal(100);
				afterEach();
			},function(a){
				a.should.equal("Ermahgerd");
				afterEach();
			});
			function afterEach(){
				count++;
				if(count == 3){
					done();
				}
			}
			comrade.data(10).data(10).data(10);
		});
		it('should gracefully handle an error in a sticksaround', function (done) {
			var comrade = communist(square);
			comrade.data("Ermahgerd").then(function(a){a.should.be.an('undefined');},function(a){a.should.equal("Ermahgerd");}).then(done, done);
		});
		it('should gracefully handle an error as a oneoff', function (done) {
			var comrade = communist(square,"Ermahgerd").then(function(a){a.should.be.an('undefined');},function(a){a.should.equal("Ermahgerd");}).then(done, done);
		});
	});
	describe('Worker reuse', function () {
		it('should work with callback applied to promise', function (done) {
			var comrade = communist(square)
			comrade.data(9).then(function (a) { a.should.equal(81); 
			comrade.data(62).then(function (a) { a.should.equal(3844); }).then(done, done);
			});
		});
		it('should work with callback applied to promise async', function (done) {
			var comrade = communist(aSquare)
			comrade.data(9).then(function (a) { a.should.equal(81); 
			comrade.data(62).then(function (a) { a.should.equal(3844); }).then(done, done);
			});
		});
		it('should work with callback passed to communist()', function (done) {
			var count = 0;
			var comrade = communist(square, function (a) { count++; a.should.equal(81); if (count === 2) { done(); } });
			comrade.data(9);
			comrade.data(9);
		});
		it('should work with callback passed to communist() async', function (done) {
			var count = 0;
			var comrade = communist(aSquare, function (a) { count++; a.should.equal(81); if (count === 2) { done(); } });
			comrade.data(9);
			comrade.data(9);
		});
	});
	describe('MapReduce', function () {
		it('should work', function (done) {
			var comrade = communist(1);
			comrade.data([1,2,3]);
			comrade.map(square);
			comrade.reduce(sum).then(function (a) { a.should.equal(14); }).then(done, done);
		});
		it('should work with chaining syntax', function (done) {
		    communist(1)
		        .data([1,2,3])
		        .map(aSquare)
		        .reduce(sum)
		        .then(function (a) { a.should.equal(14); }).then(done, done);
		});
	});
	describe('MapReduce incremental', function () {
		it('should work', function (done) {
			var comrade = communist(1,true);
			comrade.data([1,2,3]);
			comrade.map(square);
			comrade.reduce(sum);
			comrade.close().then(function (a) { a.should.equal(14); }).then(done, done);
		});
		it('should work if we add more data', function (done) {
			var comrade = communist(1,true);
			comrade.data([1,2,3]);
			comrade.map(square);
			comrade.reduce(sum);
			comrade.fetch().then(function (a) { a.should.equal(14); });
			comrade.data([4,5,6]);
			comrade.close().then(function (a) { a.should.equal(91); }).then(done, done);
		});
		it('should work with chaining syntax', function (done) {
		    communist(1,true)
		        .data([1,2,3])
		        .map(square)
		        .reduce(sum)
		        .close().then(function (a) { a.should.equal(14); }).then(done, done);
		});
		it('should work with chaining syntax and more data', function (done) {
		    communist(1,true)
		        .data([1,2,3])
		        .map(square)
		        .data([4,5,6])
		        .reduce(sum)
		        .close().then(function (a) { a.should.equal(91); }).then(done, done);
		});
	});
	
});