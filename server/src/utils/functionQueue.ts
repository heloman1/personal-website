export default class FunctionQueue {
    private registeredFunctions: (() => void)[] = [];

    addToQueue(fun: () => void) {
        this.registeredFunctions.push(fun);
    }

    runAll() {
        this.registeredFunctions.forEach((fun) => fun());
    }
}
