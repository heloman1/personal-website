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

    ngOnInit(): void {
        this.firebase_service.tryCompleteSignIn().then(async () => {
            let test = await this.firebase_service.firebase_auth.currentUser?.getIdToken();
        });
        this.http.get('/backend/servers-status').subscribe({
            next: (data) => {
                this.serverData = data as ServerData;
                for (let game of Object.keys(this.serverData)) {
                    for (let server of Object.keys(this.serverData[game])) {
                        this.serverData[game][server].queryDone = true;
                    }
                }
            },
        });
    }
}
// ./mcserver details | sed 's/\x1b\[[0-9;]*m//g'
// /Server name.*\n\n/gms
