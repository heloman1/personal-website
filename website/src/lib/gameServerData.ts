import { env } from "$env/dynamic/private";
import { exec } from "child_process";
import { promisify } from "util";

const command = promisify(exec);

export async function getGameServerData() {
    let res = command("ssh gameserver@edward-server 'echo memes from another dream'");
    console.log((await res).stdout);

    const example: GameServer[] = [
        { game: "minecraft", server: "vanilla", port: 25565, online: true },
        { game: "minecraft", server: "modded", port: 25565, online: false },
        { game: "terraria", server: "vanilla", port: 7777, online: true },
    ];
    return example;
}
