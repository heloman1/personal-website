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
    clearOnConsume: boolean;

    constructor(clearOnConsume = true) {
        this.clearOnConsume = clearOnConsume;
    }

    private registeredFunctions = new Map<number, () => void>();

    /**
     * Add a function to be run later to the queue
     * @param fun Any function
     */
    push(fun: () => void) {
        let id: number;
        do {
            id = Math.floor(Math.random() * 16777216);
        } while (this.registeredFunctions.has(id));

        this.registeredFunctions.set(id, fun);
        return id;
    }

    kick(id: number) {
        this.registeredFunctions.delete(id);
    }
    /**
     * Run all functions, and clear the queue
     */
    consumeAll() {
        this.registeredFunctions.forEach((fun) => fun());
        if (this.clearOnConsume) {
            this.clear();
        }
    }

    clear() {
        this.registeredFunctions.clear();
    }
}
