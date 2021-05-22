import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import {
    IncomingServerStatuses,
    IterableServerStatuses,
    QueryParams,
} from './types';

@Injectable({
    providedIn: 'root',
})
export class ServerDataService {
    gameToIndex: {
        [game: string]: { i: number; [server: string]: number };
    } = {};
    iterableServerData: BehaviorSubject<IterableServerStatuses[]>;
    statusText: Subject<string>;

    constructor(private http: HttpClient, private loginService: LoginService) {
        this.iterableServerData = new BehaviorSubject<IterableServerStatuses[]>(
            []
        );
        this.statusText = new Subject<string>();
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
        let serverData = this.convertServerDataFormat(data); // Add keys
        this.updateToggleableServers(serverData); // Set keys
        this.iterableServerData.next(serverData);
    }

    convertServerDataFormat(data: IncomingServerStatuses) {
        let out: IterableServerStatuses[] = [];
        for (const [game, servers] of Object.entries(data)) {
            // Keep the index of what we just pushed
            const gameIndex =
                out.push({
                    game: game,
                    servers: [],
                }) - 1;
            this.gameToIndex[game] = { i: gameIndex };
            for (const [server, status] of Object.entries(servers)) {
                const serverIndex = out[gameIndex].servers.push({
                    name: server,
                    is_online: status.is_online,
                    port: status.port,
                    canToggle: false,
                });

                this.gameToIndex[game][server] = serverIndex;
            }
        }
        // Sort the games
        out.sort((a, b) => (a.game > b.game ? 1 : -1));
        // Sort the servers in each game
        for (let gameServer of out) {
            gameServer.servers.sort((a, b) => (a.name > b.name ? 1 : -1));
        }
        return out;
    }
    // Provides Correct Status Text based on status code
    // Also, assuming server was successful, recalculate which servers are toggleable
    private handleServerResponse(query: QueryParams, statusCode: number) {
        let text = 'No Server Response? How did you manage that?';
        const { game, server, command } = query;
        const gameIndex = this.gameToIndex[game].i;
        const serverIndex = this.gameToIndex[game][server];
        const serverData = this.iterableServerData.getValue();
        // Update what's online
        switch (statusCode) {
            case 200:
                switch (command) {
                    case 'start':
                    case 'restart':
                        serverData[gameIndex].servers[serverIndex].is_online =
                            true;
                        this.updateToggleableServers(serverData);
                        this.iterableServerData.next(serverData);
                        text = 'Command Successful';
                        break;
                    case 'stop':
                        serverData[gameIndex].servers[serverIndex].is_online =
                            false;
                        this.updateToggleableServers(serverData);
                        this.iterableServerData.next(serverData);
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

    // Calculate which servers are able to be toggled, based on required ports
    private updateToggleableServers(data: IterableServerStatuses[]) {
        //Enforce that servers cant share ports
        // Get list of in-use ports
        let usedPorts: Set<number> = new Set();
        for (const game of data) {
            for (const server of game.servers) {
                if (server.is_online) {
                    usedPorts.add(server.port); // This port is in use
                }
            }
        }

        for (const game of data) {
            for (const server of game.servers) {
                // If port is in use and the current server isn't the one using it
                if (usedPorts.has(server.port) && !server.is_online) {
                    server.canToggle = false;
                } else {
                    // Either the port is not in use, or this *is* the server using the port
                    // Either way, allow buttons to be pressed
                    server.canToggle = true;
                }
            }
        }
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
