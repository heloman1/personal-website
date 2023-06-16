import { env } from "$env/dynamic/private";

export async function getGameServerData() {
    if (env.NODE_ENV === "development") {
        const example: GameServer[] = [
            { game: "minecraft", server: "vanilla", port: 25565, online: true },
            { game: "minecraft", server: "modded", port: 25565, online: false },
            { game: "terraria", server: "vanilla", port: 7777, online: true },
        ];
        return example;
    } else {
        throw "Not Implemented"
    }
}