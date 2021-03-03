
export interface Config {
    insecure: boolean;
    port: number;
}


export default function processArgs(): Config {
    const insecure = process.argv[2] === "insecure" ? true : false;
    let port: number;

    if (process.argv[3]) {
        port = +process.argv[3];
    } else if (insecure) {
        port = 8080;
    } else {
        port = 443;
    }

    return {
        insecure: insecure,
        port: port,
    };
}
