import { ServerStatuses } from "../../additional";
// So gameData and gameCommand can both access it
const serverDataCache: ServerStatuses = {};
export default serverDataCache;
