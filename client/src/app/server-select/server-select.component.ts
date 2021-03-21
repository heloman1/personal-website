import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/firebase.service';
import { QueryParams, ServerData, ServerDataValue } from './types';
import { Router } from '@angular/router';
import { TitleService } from '../services/title.service';
@Component({
    selector: 'app-server-select',
    templateUrl: './server-select.component.html',
    styleUrls: ['./server-select.component.scss'],
})
export class ServerSelectComponent implements OnInit, OnDestroy {
    constructor(
        private loginService: LoginService,
        private _httpClient: HttpClient,
        private router: Router,
        private title: TitleService
    ) {}

    statusText = ''; // Informational Text displayed next to refresh button
    serverData: ServerData = {}; // Object that holds all server state data
    doneLoading = false; // To show/hide the loading pane
    signedIn = false; // To set the SignInOut button state
    ngOnInit(): void {
        this.title.setTitle('Server Panel');
        // Is the url a sign-in url?
        this.loginService.firebase_auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.signedIn = true;
                // Load card data
                this.http.functions.fetchCardData().then((data) => {
                    this.refreshCards();
                });
            } else {
                this.signedIn = false;
                this.doneLoading = true;
            }
        });
    }

    ngOnDestroy() {
        this.title.setTitle('');
    }

    async onCardButtonClick(query: QueryParams) {
        // Disable all buttons
        this.iterateServerKeys((data) => {
            data.queryDone = false;
        });
        // Do the query
        let statusCode = await this.http.functions.sendCommand(query);
        // Update online state
        this.http.handleServerResponse(query, statusCode);
        // Reenable appropriate buttons
        this.disableInvalidCards();
    }

    // serverData is technically missing queryDone keys when first fetching
    // This happens to add them
    // Emphasis on "happens to"
    disableInvalidCards() {
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
                data.queryDone = false;
            } else {
                // Either port is not in use, or this *is* the server using the port
                // Either way, allow buttons to be pressed
                data.queryDone = true;
            }
        });
    }

    async signInOut() {
        if (this.signedIn) {
            if (await this.loginService.signOut()) {
                window.location.reload();
            }
        } else {
            this.router.navigateByUrl('/servers/login');
        }
    }

    async refreshCards() {
        this.doneLoading = false;
        this.serverData = await this.http.functions.fetchCardData();
        this.disableInvalidCards();
        this.doneLoading = true;
    }

    iterateServerKeys(fun: (data: ServerDataValue) => void) {
        for (let game of Object.keys(this.serverData)) {
            for (let server of Object.keys(this.serverData[game])) {
                fun(this.serverData[game][server]);
            }
        }
    }

    http = {
        functions: {
            fetchCardData: async () => {
                return (await this._httpClient
                    .get('/backend/servers-status', {
                        headers: {
                            Authorization: `Bearer ${await this.loginService.firebase_auth.currentUser!.getIdToken()}`,
                        },
                    })
                    .toPromise()) as ServerData;
            },
            sendCommand: async (data: QueryParams) => {
                try {
                    let res = await this._httpClient
                        .post('/backend/server-command', null, {
                            headers: {
                                Authorization: `Bearer ${await this.loginService.firebase_auth.currentUser!.getIdToken()}`,
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
            },
        },
        handleServerResponse: (query: QueryParams, statusCode: number) => {
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
                    this.statusText =
                        'Unauthorized, contact the administrator.';
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
        },
    };
}
