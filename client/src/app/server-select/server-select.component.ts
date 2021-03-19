import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/firebase.service';
import { QueryParams, ServerData } from './types';
import { Router } from '@angular/router';
import { TitleService } from '../services/title.service';
@Component({
    selector: 'app-server-select',
    templateUrl: './server-select.component.html',
    styleUrls: ['./server-select.component.scss'],
})
export class ServerSelectComponent implements OnInit, OnDestroy {
    constructor(
        private firebase_service: LoginService,
        private http: HttpClient,
        private router: Router,
        private title: TitleService
    ) {}

    statusText = '';
    serverData: ServerData = {};
    doneLoading = false;
    signedIn = false;
    ngOnInit(): void {
        this.title.setTitle('Server Panel');
        // Is the url a sign-in url?
        this.firebase_service.firebase_auth.onAuthStateChanged(async (user) => {
            this.doneLoading = false;
            if (user) {
                this.signedIn = true;
                // Load card data
                this.fetchCardData(); // this will set done loading
            } else {
                this.signedIn = false;
                console.log('You need to sign in');
                this.doneLoading = true;
            }
        });
    }

    ngOnDestroy() {
        this.title.setTitle('');
    }

    async onCardButtonClick(query: QueryParams) {
        // Disable all buttons
        this.iterateServerKeys((game, server) => {
            this.serverData[game][server].queryDone = false;
        });
        // Do the query
        let statusCode = await this.sendCommand(query);
        // Update online state
        this.handleServerResponse(query, statusCode);
        // Reenable appropriate buttons
        this.disableInvalidCards();
    }

    async sendCommand(data: QueryParams) {
        try {
            let res = await this.http
                .post('/backend/server-command', null, {
                    headers: {
                        Authorization: `Bearer ${await this.firebase_service.firebase_auth.currentUser!.getIdToken()}`,
                    },
                    params: data,
                    responseType: 'text',
                    observe: 'response',
                })
                .toPromise();
            return res.status;
        } catch (error) {
            if (error.status) {
                return error.status as number;
            } else {
                // There was an actual error
                throw error;
            }
        }
    }

    handleServerResponse(query: QueryParams, statusCode: number) {
        const { game, server, command } = query;
        // Update what's online
        switch (statusCode) {
            case 200:
                switch (command) {
                    case 'start':
                    case 'restart':
                        this.serverData[game][server].is_online = true;
                        this.statusText = 'Command Successful';
                        break;
                    case 'stop':
                        this.serverData[game][server].is_online = false;
                        this.statusText = 'Command Successful';
                        break;
                    default:
                        this.statusText =
                            'Unimplemented Commandm contact the developer';
                        break;
                }
                break;
            case 400:
                this.statusText = 'Client Syntax, contact the developer.';
                break;
            case 401:
                this.statusText = 'Unauthorized, contact the administrator.';
                break;
            case 500:
                this.statusText = 'Server error, contact the developer.';
                break;
            case 503:
                this.statusText = 'Server busy, please wait a few seconds';
                break;
            default:
                this.statusText = `Recieved unexpected status code: ${statusCode}
                Contact the developer.`;
        }
        setTimeout(() => {
            this.statusText = '';
        }, 7000);
    }

    disableInvalidCards() {
        //Enforce that servers cant share ports
        // Get list of in-use ports
        let usedPorts: Set<number> = new Set();
        this.iterateServerKeys((game, server) => {
            if (this.serverData[game][server].is_online) {
                usedPorts.add(this.serverData[game][server].port); // This port is in use
            }
        });

        this.iterateServerKeys((game, server) => {
            // If port is in use and the current server isn't the one using it
            if (
                usedPorts.has(this.serverData[game][server].port) &&
                !this.serverData[game][server].is_online
            ) {
                this.serverData[game][server].queryDone = false;
            } else {
                // Either port is not in use, or this *is* the server using the port
                // Either way, allow buttons to be pressed
                this.serverData[game][server].queryDone = true;
            }
        });
    }

    iterateServerKeys(fun: (game: string, server: string) => void) {
        for (let game of Object.keys(this.serverData)) {
            for (let server of Object.keys(this.serverData[game])) {
                fun(game, server);
            }
        }
    }

    async fetchCardData() {
        this.doneLoading = false;

        let data = (await this.http
            .get('/backend/servers-status', {
                headers: {
                    Authorization: `Bearer ${await this.firebase_service.firebase_auth.currentUser!.getIdToken()}`,
                },
            })
            .toPromise()) as ServerData;

        // This line should technically be the last thing to occur
        // It has not yet caused problems though
        this.serverData = data;

        // This will add the missing keys that typescript thinks exists
        this.disableInvalidCards();
        //this.iterateServerKeys((game, server) => {
        //    this.serverData[game][server].queryDone = false;
        //});
        this.doneLoading = true;
    }

    async signInOut() {
        if (this.signedIn) {
            if (await this.firebase_service.signOut()) {
                window.location.reload();
            }
        } else {
            this.router.navigateByUrl('/servers/login');
        }
    }
}
