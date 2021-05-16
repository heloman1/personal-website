/**
 * FunctionQueue
 *
 * Used to make multiple async functions wait until it is appropriate for them
 * to run.
 *
 * i.e. The current use case is to make multiple /backend/servers-status calls
 * wait until the first call finishes its query before sending, which stops
 * multiple redundant queries from occuring.
 */
export default class FunctionQueue {
    private registeredFunctions: (() => void)[] = [];

    /**
     * Add a function to be run later to the queue
     * @param fun Any function
     */
    addToQueue(fun: () => void) {
        this.registeredFunctions.push(fun);
    }

    /**
     * Run all functions, and clear the queue
     */
    consumeAll() {
        this.registeredFunctions.forEach((fun) => fun());
        this.registeredFunctions = [];
    }
}
