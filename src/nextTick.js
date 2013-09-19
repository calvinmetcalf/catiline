//lifted mostly from when
//https://github.com/cujojs/when/
let nextTick;
if (typeof setImmediate === 'function') {
    nextTick = setImmediate.bind(global,drainQueue);
}else{
    const codeWord = 'com.catiline.setImmediate' + Math.random();
    addEventListener('message', function (event) {
        // This will catch all incoming messages (even from other windows!), so we need to try reasonably hard to
        // avoid letting anyone else trick us into firing off. We test the origin is still this window, and that a
        // (randomly generated) unpredictable identifying prefix is present.
        if (event.source === window && event.data === codeWord) {
            drainQueue();
        }
    }, false);
    nextTick =  function() {
        postMessage(codeWord, '*');
    };
}
let mainQueue = [];

/**
 * Enqueue a task. If the queue is not currently scheduled to be
 * drained, schedule it.
 * @param {function} task
 */
catiline.nextTick = function(task) {
    if (mainQueue.push(task) === 1) {
        nextTick();
    }
};

/**
 * Drain the handler queue entirely, being careful to allow the
 * queue to be extended while it is being processed, and to continue
 * processing until it is truly empty.
 */
function drainQueue() {
    let i = 0;
    let task;
    const innerQueue = mainQueue;
    mainQueue = [];
	/*jslint boss: true */
    while (task = innerQueue[i++]) {
        task();
    }

}