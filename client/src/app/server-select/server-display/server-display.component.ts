import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { ServerDataService } from '../serverdata.service';
import { QueryParams } from '../types';
@Component({
    selector: 'app-server-display',
    templateUrl: './server-display.component.html',
    styleUrls: ['./server-display.component.scss'],
})
export class ServerDisplayComponent implements OnDestroy {
    private isSignedIn$: Subscription;

    constructor(
        private serverDataService: ServerDataService,
        private loginService: LoginService
    ) {
        this.isSignedIn$ = this.loginService.isSignedIn.subscribe(
            (signedIn) => {
                if (signedIn) {
                    this.refreshCards();
                }
            }
        );
    }

    get disableCards$() {
        return this.serverDataService.isSendingCommand;
    }
    get serverData$() {
        return this.serverDataService.iterableServerData;
    }

    refreshCards() {
        this.serverDataService.fetchData();
    }

    async onCardButtonClick(query: QueryParams) {
        await this.serverDataService.sendCommand(query);
    }

    ngOnDestroy() {
        this.isSignedIn$.unsubscribe();
    }
}
