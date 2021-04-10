import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { LoginService } from './firebase.service';

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

@Injectable({
    providedIn: 'root',
})
export class ServerDataService {
    serverData: ServerStatuses = {};
    iterableServerData: BehaviorSubject<IterableServerStatuses[]>;
    statusText: Subject<string>;

    constructor(private http: HttpClient, private loginService: LoginService) {
        this.iterableServerData = new BehaviorSubject<IterableServerStatuses[]>(
            []
        );
        this.statusText = new Subject<string>();
    }

    // Also sorts based on game name
    private ToIterableServerStatuses(serverStatuses: ServerStatuses) {
        let out: IterableServerStatuses[] = [];
        for (const [game, _servers] of Object.entries(serverStatuses)) {
            const len = out.push({
                game: game,
                servers: [],
            });
            for (const [name, status] of Object.entries(_servers)) {
                out[len - 1].servers.push({
                    name: name,
                    is_online: status.is_online,
                    port: status.port,
                    canToggle: status.canToggle,
                });
            }
        }
        out.sort((a, b) => (a.game > b.game ? 1 : -1));
        return out;
    }

    // Adds the canToggle keys, inited to false
    private ToServerStatuses(incoming: IncomingServerStatuses) {
        for (let game of Object.keys(incoming)) {
            for (let server of Object.keys(incoming[game])) {
                (incoming as ServerStatuses)[game][server].canToggle = false;
            }
        }
        return incoming as ServerStatuses;
    }

    // Fetches the data, adds canToggle keys, sets those keys, and pushes the data
    async fetchData() {
        const data = (await this.http
            .get('/backend/servers-status', {
                headers: {
                    Authorization: `Bearer ${await this.loginService.firebase_auth.currentUser!.getIdToken()}`,
                },
            })
            .toPromise()) as IncomingServerStatuses;
        this.serverData = this.ToServerStatuses(data); // Add keys
        this.updateToggleableServers(); // Set keys
        this.iterableServerData.next(
            this.ToIterableServerStatuses(this.serverData)
        );
    }

    // Provides Correct Status Text based on status code
    // Also, assuming server was successful, recalculate which servers are toggleable
    private handleServerResponse(query: QueryParams, statusCode: number) {
        let text = 'No Server Response? How did you manage that?';
        const { game, server, command } = query;
        // Update what's online
        switch (statusCode) {
            case 200:
                switch (command) {
                    case 'start':
                    case 'restart':
                        this.serverData[game][server].is_online = true;
                        this.updateToggleableServers();
                        text = 'Command Successful';
                        break;
                    case 'stop':
                        this.serverData[game][server].is_online = false;
                        this.updateToggleableServers();
                        text = 'Command Successful';
                        break;
                    default:
                        text = 'Unimplemented Command, contact the developer';
                        break;
                }
                break;
            case 400:
                text = 'Client Syntax, contact the developer.';
                break;
            case 401:
                text = 'Unauthorized, contact the administrator.';

                break;
            case 500:
                text = 'Server error, contact the developer.';
                break;
            case 503:
                text = 'Server busy, please wait a few seconds';
                break;
            default:
                text = `Recieved unexpected status code: ${statusCode}, Contact the developer.`;
        }
        this.statusText.next(text);
        setTimeout(() => {
            this.statusText.next('');
        }, 7000);
    }

    private iterateServerKeys(fun: (data: ServerStatus) => void) {
        for (let game of Object.keys(this.serverData)) {
            for (let server of Object.keys(this.serverData[game])) {
                fun(this.serverData[game][server]);
            }
        }
    }

    // Calculate which servers are able to be toggled, based on required ports
    private updateToggleableServers() {
        //Enforce that servers cant share ports
        // Get list of in-use ports
        let usedPorts: Set<number> = new Set();
        this.iterateServerKeys((data) => {
            if (data.is_online) {
                usedPorts.add(data.port); // This port is in use
            }
        });

        this.iterateServerKeys((data) => {
            // If port is in use and the current server isn't the one using it
            if (usedPorts.has(data.port) && !data.is_online) {
                data.canToggle = false;
            } else {
                // Either port is not in use, or this *is* the server using the port
                // Either way, allow buttons to be pressed
                data.canToggle = true;
            }
        });
    }

    async sendCommand(data: QueryParams) {
        let code: number;
        try {
            let res = await this.http
                .post('/backend/server-command', null, {
                    headers: {
                        Authorization: `Bearer ${await this.loginService.firebase_auth.currentUser!.getIdToken()}`,
                    },
                    params: data,
                    responseType: 'text',
                    observe: 'response',
                })
                .toPromise();
            code = res.status;
        } catch (error) {
            console.log('sendCommand caught an error');
            console.log(error);

            if (error.status) {
                code = error.status as number;
            } else {
                // There was an actual error
                throw error;
            }
        }
        this.handleServerResponse(data, code);
    }
}
