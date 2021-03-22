export default class TwoWayMap<K, V> {
    map: Map<K, V>;
    revMap: Map<V, K>;

    constructor(entries?: [K, V][] | null | undefined) {
        if (entries) {
            this.map = new Map(entries);
            let revEntries: [V, K][] = entries.map((kv) => [kv[1], kv[0]]);
            this.revMap = new Map(revEntries);
        } else {
            this.map = new Map();
            this.revMap = new Map();
        }
    }
}
