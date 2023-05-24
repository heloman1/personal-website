import { exec } from "child_process";
import { promisify } from "util";

const shell = promisify(exec);

export async function doSsh(command: string) {
    try {
        return (await shell(command)).stdout;
    } catch (err) {
        console.error("fetchData: Error when executing shell command");
        console.error(`(${command})`);
        console.error(err);
        throw err;
    }
}
