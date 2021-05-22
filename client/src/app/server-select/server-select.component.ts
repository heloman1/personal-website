import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { QueryParams } from './types';
import { TitleService } from '../services/title.service';
import { ServerDataService } from './serverdata.service';

@Component({
    selector: 'app-server-select',
    templateUrl: './server-select.component.html',
    styleUrls: ['./server-select.component.scss'],
})
export class ServerSelectComponent implements OnInit, OnDestroy {
    constructor(
        private loginService: LoginService,
        public ServerDataService: ServerDataService,
        private title: TitleService
    ) {}

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
                await this.ServerDataService.fetchData();
                this.disableCards = false;
            } else {
                this.signedIn = false;
            }
            this.doneLoading = true;
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
}
