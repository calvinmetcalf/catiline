mocha.setup({
    ui: "bdd",
    globals: ["console"],
    timeout: 2000000000
});
chai.should();

function square(x) {
	return x * x;
}
function sum(a, b) {
	return a + b;
}

describe('communist()', function () {
	it('should work when given a function and data directly', function (done) {
		communist(square, 9).then(function (a) { a.should.equal(81); }).then(done, done);
	});
	it('should allow chaining of data functions, with callback passed to communist()', function (done) {
		var count = 0;
		var comrade = communist(square, function (a) { count++; a.should.equal(81); if (count === 2) { done(); } });
		comrade.data(9).data(9);
	});
	describe('Worker reuse', function () {
		it('should work with callback applied to promise', function (done) {
			var comrade = communist(square)
			comrade.data(9).then(function (a) { a.should.equal(81); }).then(done, done);
			comrade.data(62).then(function (a) { a.should.equal(3844); }).then(done, done);
		});
		it('should work with callback passed to communist()', function (done) {
			var count = 0;
			var comrade = communist(square, function (a) { count++; a.should.equal(81); if (count === 2) { done(); } });
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
		        .map(square)
		        .reduce(sum)
		        .then(function (a) { a.should.equal(14); }).then(done, done);
		});
	});
});