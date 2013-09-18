//lifted wholesale from when
//https://github.com/cujojs/when/
let nextTick;
if (typeof setImmediate === 'function') {
    nextTick = setImmediate.bind(global);
}
else if (typeof MessageChannel !== 'undefined') {
    const channel = new MessageChannel();
    channel.port1.onmessage = drainQueue;
    nextTick = function() {
        channel.port2.postMessage(0);
    };
}
else if (typeof process === 'object' && process.nextTick) {
    nextTick = process.nextTick;
}
else {
    nextTick = function(t) {
        setTimeout(t, 0);
    };
}
let handlerQueue = [];

/**
 * Enqueue a task. If the queue is not currently scheduled to be
 * drained, schedule it.
 * @param {function} task
 */
function enqueue(task) {
    if (handlerQueue.push(task) === 1) {
        nextTick(drainQueue);
    }
}

/**
 * Drain the handler queue entirely, being careful to allow the
 * queue to be extended while it is being processed, and to continue
 * processing until it is truly empty.
 */
function drainQueue() {
	/*jslint boss: true */
    let i = 0;
    let task;
	/*jslint boss: true */
    while (task = handlerQueue[i++]) {
        task();
    }

    handlerQueue = [];
}
catiline.setImmediate = enqueue;