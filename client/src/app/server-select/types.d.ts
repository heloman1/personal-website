export type QueryParams = {
    game: string;
    server: string;
    command: 'start' | 'stop' | 'restart';
};

interface IncomingServerStatuses {
    [game: string]: {
        [server: string]: {
            is_online: boolean;
            port: number;
        };
    };
}

interface ServerStatus {
    is_online: boolean;
    port: number;
    canToggle: boolean;
}

interface ServerStatuses {
    [game: string]: {
        [server: string]: ServerStatus;
    };
}

export interface IterableServerStatus {
    name: string;
    is_online: boolean;
    port: number;
    canToggle: boolean;
}

export interface IterableServerStatuses {
    game: string;
    servers: IterableServerStatus[];
}