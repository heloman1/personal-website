import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/firebase.service';

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

@Component({
    selector: 'app-server-select',
    templateUrl: './server-select.component.html',
    styleUrls: ['./server-select.component.scss'],
})
export class ServerSelectComponent implements OnInit {
    constructor(
        private firebase_service: LoginService,
        private http: HttpClient
    ) {}
    serverData: ServerData = {};

    async handleServerEvent(data: QueryParams) {
        this.setAllButtons(false);
        await this.sendCommand(data);
        this.updateDisabledServers();
    }

    async sendCommand(data: QueryParams) {
        const { game, server, command } = data;
        // Disable card buttons
        this.serverData[game][server].queryDone = false;

        // Do the query
        // TODO: Firebase auth required here
        let res = await this.http
            .post('/backend/server-command', null, {
                params: data,
                responseType: 'text',
                observe: 'response',
            })
            .toPromise();

        switch (res.status) {
            case 200:
                if (command === 'start' || command === 'restart') {
                    this.serverData[game][server].is_online = true;
                } else if (command === 'stop') {
                    this.serverData[game][server].is_online = false;
                }
                break;
            case 400:
                break;
        }

        this.serverData[game][server].queryDone = true;
    }

    updateDisabledServers() {
        //Enforce that servers cant share ports
        // Get list of in-use ports
        let ports: number[] = [];
        this.iterateServers((game, server) => {
            if (this.serverData[game][server].is_online) {
                ports.push(this.serverData[game][server].port);
            }
        });

        this.iterateServers((game, server) => {
            // If port is in use and the current server isnt the one using it
            if (
                ports.includes(this.serverData[game][server].port) &&
                !this.serverData[game][server].is_online
            ) {
                this.serverData[game][server].queryDone = false;
            } else {
                // Either port is not in use, or this is the server using a port
                // Either way, allow buttons to be pressed
                this.serverData[game][server].queryDone = true;
            }
        });
    }

    setAllButtons(toggle: boolean) {
        this.iterateServers((game, server) => {
            this.serverData[game][server].queryDone = false;
        });
    }
    iterateServers(fun: (game: string, server: string) => void) {
        for (let game of Object.keys(this.serverData)) {
            for (let server of Object.keys(this.serverData[game])) {
                fun(game, server);
            }
        }
    }

    async getCardData() {
        this.http
            .get('/backend/servers-status', {
                headers: {
                    Authorization: `Bearer ${await this.firebase_service.user?.getIdToken()}`,
                },
            })
            .subscribe({
                next: (data) => {
                    this.serverData = data as ServerData;
                    this.iterateServers((game, server) => {
                        this.serverData[game][server].queryDone = true;
                    });
                },
            });
    }

    ngOnInit(): void {
        this.firebase_service.tryCompleteSignIn().then(async (success) => {
            if (success) {
                let token = await this.firebase_service.user!.getIdToken();
                console.log(token);
            }
        });
        this.getCardData();
    }
}
// ./mcserver details | sed 's/\x1b\[[0-9;]*m//g'
// /Server name.*\n\n/gms
