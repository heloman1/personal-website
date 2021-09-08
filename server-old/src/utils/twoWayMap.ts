/**
 * TwoWayMap
 * 
 * A simple two way map
 */
export default class TwoWayMap<K, V> {
    private map: Map<K, V>;
    private revMap: Map<V, K>;

    constructor(entries?: [K, V][] | null | undefined) {
        if (entries) {
            this.map = new Map(entries);
            this.revMap = new Map(entries.map((kv) => [kv[1], kv[0]]));
        } else {
            this.map = new Map();
            this.revMap = new Map();
        }
    }

    get(key: K) {
        return this.map.get(key);
    }
    getRev(val: V) {
        return this.revMap.get(val);
    }
    set(key: K, val: V) {
        this.map.set(key, val);
        this.revMap.set(val, key);
    }
    
    keys() {
        return this.map.keys();
    }
    values() {
        return this.revMap.keys();
    }
    entries() {
        return this.map.entries();
    }
}
