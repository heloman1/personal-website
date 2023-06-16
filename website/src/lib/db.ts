import BetterSqlite3 from "better-sqlite3";

class Db {
    private sqlite: BetterSqlite3.Database;
    constructor() {
        this.sqlite = BetterSqlite3(":memory:")
    }

}