mocha.setup({
    ui: "bdd",
    globals: ["console"],
    timeout: 2000000000
});
chai.should();

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
//communist.URL=true;
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
				a.preventDefault();
				a.message.indexOf("Ermahgerd").should.be.at.least(0);
				afterEach();
			});
			function afterEach(){
				count++;
				if(count == 3){
					done();
				}
			}
			comrade.data(10).data("Ermahgerd").data(10);
		});
		it('should gracefully handle an error in a sticksaround', function (done) {
			var comrade = communist(square);
			comrade.data("Ermahgerd").then(function(a){a.should.be.an('undefined');},function(a){a.indexOf("Ermahgerd").should.be.at.least(0);}).then(done, done);
		});
		it('should gracefully handle an error as a oneoff', function (done) {
			var comrade = communist(square,"Ermahgerd").then(function(a){a.should.be.an('undefined');},function(a){a.indexOf("Ermahgerd").should.be.at.least(0);}).then(done, done);
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
			var comrade = communist(1, true);
			comrade.data([1,2,3]);
			comrade.map(square);
			comrade.reduce(sum).then(function (a) { a.should.equal(14); }).then(done, done);
		});
		it('should work with chaining syntax', function (done) {
		    communist(1, true)
		        .data([1,2,3])
		        .map(aSquare)
		        .reduce(sum)
		        .then(function (a) { a.should.equal(14); }).then(done, done);
		});
	});
	describe('MapReduce incremental', function () {
		it('should work', function (done) {
			var comrade = communist(1);
			comrade.data([1,2,3]);
			comrade.map(square);
			comrade.reduce(sum);
			comrade.close().then(function (a) { a.should.equal(14); }).then(done, done);
		});
		it('should work if we add more data', function (done) {
			var comrade = communist(1);
			comrade.data([1,2,3]);
			comrade.map(square);
			comrade.reduce(sum);
			comrade.fetch().then(function (a) { a.should.equal(14); });
			comrade.data([4,5,6]);
			comrade.close().then(function (a) { a.should.equal(91); }).then(done, done);
		});
		it('should work with chaining syntax', function (done) {
		    communist(1)
		        .data([1,2,3])
		        .map(square)
		        .reduce(sum)
		        .close().then(function (a) { a.should.equal(14); }).then(done, done);
		});
		it('should work with chaining syntax and more data', function (done) {
		    communist(1)
		        .data([1,2,3])
		        .map(square)
		        .data([4,5,6])
		        .reduce(sum)
		        .close().then(function (a) { a.should.equal(91); }).then(done, done);
		});
		it('should work with chaining syntax, more data, and more workers', function (done) {
		    communist(3)
		        .data([1,2,3])
		        .map(square)
		        .data([4,5,6])
		        .reduce(sum)
		        .close().then(function (a) { a.should.equal(91); }).then(done, done);
		});
	});
	describe('Ajax', function () {
		it('should work', function (done) {
			communist.ajax("test.json").then(function(a){ a.should.deep.equal({"a":1,"b":2}); }).then(done, done);
		});
		it('should work with after set', function (done) {
			communist.ajax("test.json",function(a){a.c=3;return a;}).then(function(a){ a.should.deep.equal({"a":1,"b":2,"c":3}); }).then(done, done);
		});
		it('should work with after set to async', function (done) {
			communist.ajax("test.json",function(a,cb){a.c=3;cb(a);}).then(function(a){ a.should.deep.equal({"a":1,"b":2,"c":3}); }).then(done, done);
		});
		it('should work with text', function (done) {
			communist.ajax("test.json",function(a){return a.split("");},true).then(function(a){ a.should.deep.equal(["{", '"', "a", '"', ":", "1", ",", '"', "b", '"', ":", "2", "}"]); }).then(done, done);
		});
		it('should work with an array buffer', function (done) {
			communist.ajax("test.json",function(a,cb){var b = new Uint32Array(a.split("").map(function(v){return v.charCodeAt()})).buffer; cb(b,[b])},true).then(function(a){ a.should.deep.equal(new Uint32Array([123, 34, 97, 34, 58, 49, 44, 34, 98, 34, 58, 50, 125]).buffer); }).then(done, done);
		});
	});
	describe('Import Scripts', function () {
		it("should be able to import scripts",function (done){
			communist(function(a){importScripts('fakeLib.js');return a;}, 9).then(function (a) { a.should.equal(9); }).then(done, done);
		});
		it("should be able to import reletive urls",function (done){
			communist(function(a){importScripts('../test/fakeLib.js');return a;}, 9).then(function (a) { a.should.equal(9); }).then(done, done);
		});
		it("should be able to import 2 scripts",function (done){
			communist(function(a){importScripts("fakeLib.js",'../test/fakeLib.js');return a;}, 9).then(function () {},function(a){a.indexOf("tried to import twice").should.be.at.least(0)}).then(done, done);
		});
		it("should be able to import no scripts",function (done){
			communist(function(a){importScripts();return a;}, 9).then(function (a) { a.should.equal(9); }).then(done, done);
		});
		it("should be able to import scripts in a sticks around",function (done){
			var comrade = communist(function(a){importScripts('fakeLib.js');return a;});
			comrade.data(9).then(function (a) { a.should.equal(9); }).then(done, done);
		});
		it("should be able to import scripts in a sticks around and call it twice",function (done){
			var comrade = communist(function(a){importScripts('fakeLib.js');return a;});
			comrade.data(9).then(function (a) { a.should.equal(9); 
			comrade.data(7).then(function(aa){aa.should.equal(7)}).then(done,done);
			});
		});
	});
	describe('Objects', function () {
		it("should be able create an object worker",function (done){
			var comrade = communist({sum:sum,aSquare:aSquare,square:square});
			comrade.aSquare(3).then(function(a){
				a.should.equal(9);
			}).then(function(){
				return comrade.sum(20,100);
			}).then(function(a){a.should.equal(120)}).then(function(){
				return comrade.square(5);
			}).then(function(a){a.should.equal(25)}).then(done,done);
		});
		it("and catch an error in it",function (done){
			var comrade = communist({sum:sum,aSquare:aSquare,square:square});
			comrade.square("explode").then(function(){},function(a){a.indexOf("explode").should.be.at.least(0);}).then(done,done);
		});
		it("and then do more stuff",function (done){
			var comrade = communist({sum:sum,aSquare:aSquare,square:square});
			comrade.square("explode").then(function(){},function(a){a.indexOf("explode").should.be.at.least(0);
			comrade.square(9).then(function(a){a.should.equal(81)}).then(done,done);
			});
		});
	});

});