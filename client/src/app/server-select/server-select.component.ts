import { HttpClient, HttpResponse } from '@angular/common/http';
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
    ) {
        title.setTitle('Server Panel');
    }
    statusText = '';
    serverData: ServerData = {};
    doneLoading = false;
    signedIn = false;
    ngOnInit(): void {
        // Is the url a sign-in url?
        this.firebase_service.firebase_auth.onAuthStateChanged(async (user) => {
            this.doneLoading = false;
            if (user) {
                this.signedIn = true;
                // Load card data
                this.getCardData(); // this will set done loading
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
    async handleCardEvent(query: QueryParams) {
        // Disable all buttons
        this.iterateServerKeys((game, server) => {
            this.serverData[game][server].queryDone = false;
        });
        // Do the query
        let res = await this.sendCommand(query);
        // Update online state
        this.updateCardOnlineState(query, res);
        // Reenable appropriate buttons
        this.reenableCardButtons();
    }

    async sendCommand(data: QueryParams) {
        // Do the query
        // TODO: Firebase auth required here
        return await this.http
            .post('/backend/server-command', null, {
                headers: {
                    Authorization: `Bearer ${await this.firebase_service.firebase_auth.currentUser!.getIdToken()}`,
                },
                params: data,
                responseType: 'text',
                observe: 'response',
            })
            .toPromise();
    }

    updateCardOnlineState(query: QueryParams, res: HttpResponse<string>) {
        const { game, server, command } = query;
        // Update what's online
        switch (res.status) {
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
                this.statusText = `Recieved unexpected status code: ${res.status}`;
        }
        setTimeout(() => {
            this.statusText = '';
        }, 7000);
    }

    reenableCardButtons() {
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

    async getCardData() {
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
        this.reenableCardButtons();
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
