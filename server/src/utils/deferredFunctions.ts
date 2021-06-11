/**
 * DeferredFunctions
 *
 * Used to make multiple async functions wait until it is appropriate for them
 * to run.
 *
 * i.e. The current use case is to make multiple /backend/servers-status calls
 * wait until the first call finishes its query before sending, which stops
 * multiple redundant queries from occuring.
 */
export default class DeferredFunctions<T, U> {
    clearOnConsume: boolean;

    get count() {
        return this.registeredFunctions.size;
    }
    constructor(config = { clearOnConsume: true }) {
        this.clearOnConsume = config.clearOnConsume;
    }

    private registeredFunctions = new Map<number, (data: T) => U>();

    /**
     * Add a function to be run later to the queue
     * @param fun Any function
     */
    push(fun: (data: T) => U) {
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
    consumeAll(data: T): U[] {
        const out = [];
        for (const fun of this.registeredFunctions.values()) {
            const ret = fun(data);
            // Don't make an array of undefined values
            // (If T === void, just return [])
            if (typeof ret == "undefined") {
                out.push(ret);
            }
        }
        return out;
    }

    clear() {
        this.registeredFunctions.clear();
    }
}
