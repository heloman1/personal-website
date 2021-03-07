export type QueryParams = {
    game: string;
    server: string;
    command: 'start' | 'stop' | 'restart';
};

export interface ServerDataValue {
    is_online: boolean;
    port: number;
    queryDone: boolean;
}
export interface ServerData {
    [game: string]: {
        [server: string]: ServerDataValue;
    };
}