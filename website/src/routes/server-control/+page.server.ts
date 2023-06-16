import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { exec } from "child_process";
import { promisify } from "util";
import { env } from "$env/dynamic/private";
import { getGameServerData } from "$lib/gameServerData";


interface GameServer {
    game: string;
    server: string;
    port: number;
}

const command = promisify(exec);




export const load: PageServerLoad = async ({ params }) => {
    return {
        streamed: { gameServerData: getGameServerData() },
    };
};
