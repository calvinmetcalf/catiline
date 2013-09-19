var func = 'function';
// Creates a deferred: an object with a promise and corresponding resolve/reject methods
function Deferred() {
	// The `handler` variable points to the function that will
	// 1) handle a .then(onFulfilled, onRejected) call
	// 2) handle a .resolve or .reject call (if not fulfilled)
	// Before 2), `handler` holds a queue of callbacks.
	// After 2), `handler` is a simple .then handler.
	// We use only one function to save memory and complexity.
	let handler = function(onFulfilled, onRejected, value) {
		// Case 1) handle a .then(onFulfilled, onRejected) call
		if (onFulfilled !== handler) {
			const createdDeffered = createDeferred();
			handler.queue.push({
				deferred: createdDeffered,
				resolve: onFulfilled,
				reject: onRejected
			});
			return createdDeffered.promise;
		}

		// Case 2) handle a .resolve or .reject call
		// (`onFulfilled` acts as a sentinel)
		// The actual function signature is
		// .re[ject|solve](sentinel, success, value)
		let action = onRejected ? 'resolve' : 'reject';
		for (let i = 0, l = handler.queue.length; i < l; i++) {
			const queue = handler.queue[i];
			const deferred = queue.deferred;
			const callback = queue[action];
			if (typeof callback !== func) {
				deferred[action](value);
			}
			else {
				execute(callback, value, deferred);
			}
		}
		// Replace this handler with a simple resolved or rejected handler
		handler = createHandler(promise, value, onRejected);
	};

	function Promise() {
		this.then = function(onFulfilled, onRejected) {
			return handler(onFulfilled, onRejected);
		};
	}
	const promise = new Promise();
	this.promise = promise;
	// The queue of deferreds
	handler.queue = [];

	this.resolve = function(value) {
		if (handler.queue) {
			handler(handler, true, value);
		}
	};

	this.fulfill = this.resolve;

	this.reject = function(reason) {
		if (handler.queue) {
			handler(handler, false, reason);
		}
	};
}

function createDeferred() {
	return new Deferred();
}

// Creates a fulfilled or rejected .then function
function createHandler(promise, value, success) {
	return function(onFulfilled, onRejected) {
		const callback = success ? onFulfilled : onRejected;
		if (typeof callback !== func) {
			return promise;
		}
		const result = createDeferred();
		execute(callback, value, result);
		return result.promise;
	};
}

// Executes the callback with the specified value,
// resolving or rejecting the deferred
function execute(callback, value, deferred) {
	catiline.nextTick(function() {
		try {
			const result = callback(value);
			if (result && typeof result.then === func) {
				result.then(deferred.resolve, deferred.reject);
			}
			else {
				deferred.resolve(result);
			}
		}
		catch (error) {
			deferred.reject(error);
		}
	});
}
catiline.deferred = createDeferred;
// Returns a resolved promise
catiline.resolve = function(value) {
	const promise = {};
	promise.then = createHandler(promise, value, true);
	return promise;
};
// Returns a rejected promise
catiline.reject = function(reason) {
	const promise = {};
	promise.then = createHandler(promise, reason, false);
	return promise;
};
// Returns a deferred

catiline.all = function(array) {
	const promise = createDeferred();
	const len = array.length;
	let resolved = 0;
	const out = [];
	const onSuccess = function(n) {
		return function(v) {
			out[n] = v;
			resolved++;
			if (resolved === len) {
				promise.resolve(out);
			}
		};
	};
	array.forEach(function(v, i) {
		v.then(onSuccess(i), function(a) {
			promise.reject(a);
		});
	});
	return promise.promise;
};