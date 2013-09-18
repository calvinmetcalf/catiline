/*!From setImmediate Copyright (c) 2012 Barnesandnoble.com,llc, Donavon West, and Domenic Denicola @license MIT https://github.com/NobleJS/setImmediate */
if (window.setImmediate) {
	catiline.setImmediate = setImmediate;
}
else {

	const Task = function(handler, args) {
		this.handler = handler;
		this.args = args;
	};
	Task.prototype.run = function() {
		// See steps in section 5 of the spec.
		if (typeof this.handler === 'function') {
			// Choice of `thisArg` is not in the setImmediate spec; `undefined` is in the setTimeout spec though:
			// http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html
			this.handler.apply(undefined, this.args);
		}
		else {
			const scriptSource = '' + this.handler;
			/*jshint evil: true */
			eval(scriptSource);
		}
	};

	let nextHandle = 1; // Spec says greater than zero
	const tasksByHandle = {};
	let currentlyRunningATask = false;
	const tasks = {};
	tasks.addFromSetImmediateArguments = function(args) {
		const handler = args[0];
		const argsToHandle = Array.prototype.slice.call(args, 1);
		let task = new Task(handler, argsToHandle);

		const thisHandle = nextHandle++;
		tasksByHandle[thisHandle] = task;
		return thisHandle;
	};
	tasks.runIfPresent = function(handle) {
		// From the spec: 'Wait until any invocations of this algorithm started before this one have completed.'
		// So if we're currently running a task, we'll need to delay this invocation.
		if (!currentlyRunningATask) {
			const task = tasksByHandle[handle];
			if (task) {
				currentlyRunningATask = true;
				try {
					task.run();
				}
				finally {
					delete tasksByHandle[handle];
					currentlyRunningATask = false;
				}
			}
		}
		else {
			// Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
			// 'too much recursion' error.
			setTimeout(function() {
				tasks.runIfPresent(handle);
			}, 0);
		}
	};
	// Installs an event handler on `global` for the `message` event: see
	// * https://developer.mozilla.org/en/DOM/window.postMessage
	// * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

	const MESSAGE_PREFIX = 'com.catilinejs.setImmediate' + Math.random();

	const isStringAndStartsWith = function(string, putativeStart) {
		return typeof string === 'string' && string.substring(0, putativeStart.length) === putativeStart;
	};

	const onGlobalMessage = function(event) {
		// This will catch all incoming messages (even from other windows!), so we need to try reasonably hard to
		// avoid letting anyone else trick us into firing off. We test the origin is still this window, and that a
		// (randomly generated) unpredictable identifying prefix is present.
		if (event.source === window && isStringAndStartsWith(event.data, MESSAGE_PREFIX)) {
			const handle = event.data.substring(MESSAGE_PREFIX.length);
			tasks.runIfPresent(handle);
		}
	};
	if (window.addEventListener) {
		window.addEventListener('message', onGlobalMessage, false);
	}
	else {
		window.attachEvent('onmessage', onGlobalMessage);
	}

	catiline.setImmediate = function() {
		const handle = tasks.addFromSetImmediateArguments(arguments);

		// Make `global` post a message to itself with the handle and identifying prefix, thus asynchronously
		// invoking our onGlobalMessage listener above.
		window.postMessage(MESSAGE_PREFIX + handle, '*');

		return handle;
	};
}