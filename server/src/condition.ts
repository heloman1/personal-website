export default class Condition {
    state: boolean;
    constructor(b: boolean) {
        this.state = b;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async waitForCondition(expected: boolean) {
        if (this.state === expected) {
            return;
        }
        await this.sleep(500);
        await this.waitForCondition(expected);
    }
}
