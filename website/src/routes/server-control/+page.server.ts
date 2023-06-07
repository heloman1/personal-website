import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { exec } from "child_process";
import { promisify } from "util";
import { env } from "$env/dynamic/private";

interface GameServer {
    game: string;
    server: string;
    port: number;
}

const command = promisify(exec);


async function getGameServerData() {
    if (env.NODE_ENV === "development") {
        const example: GameServer[] = [
            { game: "minecraft", server: "vanilla", port: 25565 },
            { game: "minecraft", server: "modded", port: 25565 },
            { game: "terraria", server: "vanilla", port: 7777 },
        ];
        return example;
    } else {
        return [];
        // return (await command("echo THIS IS A TEST")).stdout;
    }
}

export const load: PageServerLoad = async ({ params }) => {
    console.log("Is this even running?");
    return {
        streamed: {gameServerData: getGameServerData()},
    };
};
