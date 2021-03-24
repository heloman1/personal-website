export default class FunctionQueue {
    private registeredFunctions: (() => void)[] = [];

    addToQueue(fun: () => void) {
        this.registeredFunctions.push(fun);
    }

    consumeAll() {
        this.registeredFunctions.forEach((fun) => fun());
        this.registeredFunctions = [];
    }
}
