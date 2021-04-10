import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/firebase.service';
import { QueryParams, ServerData, ServerDataValue } from './types';
import { Router } from '@angular/router';
import { TitleService } from '../services/title.service';
import { ServerDataService } from '../services/serverdata.service';
import { Observable, Subscription } from 'rxjs';
@Component({
    selector: 'app-server-select',
    templateUrl: './server-select.component.html',
    styleUrls: ['./server-select.component.scss'],
})
export class ServerSelectComponent implements OnInit, OnDestroy {
    constructor(
        private loginService: LoginService,
        public ServerDataService: ServerDataService,
        private router: Router,
        private title: TitleService
    ) {}
    //serverData: ServerData = {}; // Object that holds all server state data
    disableCards = true;
    doneLoading = false; // To show/hide the loading pane
    signedIn = false; // To set the SignInOut button state
    ngOnInit(): void {
        this.title.setTitle('Server Panel');
        // Is the url a sign-in url?
        this.loginService.firebase_auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.signedIn = true;
                // Load card data
                this.refreshCards();
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
        this.disableCards = true;
        await this.ServerDataService.sendCommand(query);
        this.disableCards = false;
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
        await this.ServerDataService.fetchData();
        this.doneLoading = true;
    }
}
