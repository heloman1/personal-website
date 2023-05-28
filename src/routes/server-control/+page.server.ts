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
            { game: "a", server: "b", port: 4568 },
            { game: "a", server: "c", port: 4569 },
            { game: "adsf", server: "piou", port: 4567 },
        ];
        return example;
    } else {
        return [];
        // return (await command("echo THIS IS A TEST")).stdout;
    }
}

export const load: PageServerLoad = ({ params }) => {
    return {
        placeholder: getGameServerData(),
    };
};
