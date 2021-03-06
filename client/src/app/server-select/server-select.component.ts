import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/firebase.service';

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
    serverNameList: string[] = [];
    async toggleServer(server: { game: string; server: string }) {
        //this.serverData[server_index].queryDone = false;
        //this.serverData[server_index].queryDone = true;
        this.serverData[server.game][server.server].queryDone = false;

        //pretend to do things
        setTimeout(() => {
            this.serverData[server.game][server.server].queryDone = true;
            this.serverData[server.game][server.server].is_online = !this
                .serverData[server.game][server.server].is_online;
        }, 1000);
    }

    ngOnInit(): void {
        this.firebase_service.tryCompleteSignIn().then(async () => {
            let test = await this.firebase_service.firebase_auth.currentUser?.getIdToken();
        });
        this.http.get('/backend/servers-status').subscribe({
            next: (data) => {
                console.log(data);
                this.serverData = data as ServerData;
                this.serverNameList = [];
                for (let game of Object.keys(this.serverData)) {
                    for (let server of Object.keys(this.serverData[game])) {
                        this.serverData[game][server].queryDone = true;
                        this.serverNameList.push(server);
                    }
                }
                this.serverNameList.sort();

                console.log(this.serverData);
            },
        });
    }
}
// ./mcserver details | sed 's/\x1b\[[0-9;]*m//g'
// /Server name.*\n\n/gms
