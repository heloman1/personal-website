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

export interface IterableServerStatuses {
    game: string;
    servers: CardData[];
}

export interface CardData {
    name: string;
    is_online: boolean;
    port: number;
    canToggle: boolean;
}
