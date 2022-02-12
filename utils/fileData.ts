import { readFile, watch } from "fs/promises";

type gameFolder = string;
type PrettyName = string;

export type GameFolderToPrettyName = {
    [game: gameFolder]: PrettyName;
};
export type PrettyNameToGameFolder = {
    [prettyName: PrettyName]: gameFolder;
};

function invertObject(obj: { [key: string]: string }) {
    const out: { [key: string]: string } = {};
    Object.entries<string>(obj).forEach(([k, v]) => {
        if (out[v]) {
            throw `The pretty name ${v} is being used twice`;
        }
        out[v] = k;
    });
    return out;
}

async function parseFile(file: string) {
    return JSON.parse((await readFile(file)).toString());
}
const gamesFile = `${process.cwd()}/private/games.json`;
const emailsFile = `${process.cwd()}/private/emails.json`;

// TODO: Do typechecking
async function* gamesList() {
    const obj = (await parseFile(gamesFile)) as GameFolderToPrettyName;
    yield {
        folderToPrettyName: obj,
        PrettyNameToFolder: invertObject(obj) as PrettyNameToGameFolder,
    };
    const watcher = watch(gamesFile);
    for await (const _ of watcher) {
        const obj = await parseFile(gamesFile);
        yield {
            folderToPrettyName: obj,
            PrettyNameToFolder: invertObject(obj),
        };
    }
}

// TODO: Do typechecking
async function* emailsList() {
    yield (await parseFile(emailsFile)) as string[];
    const watcher = watch(emailsFile);
    for await (const _ of watcher) {
        yield (await parseFile(emailsFile)) as string[];
    }
}

export { emailsList, gamesList };
