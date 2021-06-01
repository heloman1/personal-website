import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { TitleService } from 'src/app/services/title.service';
import { ServerDataService } from '../serverdata.service';
import { QueryParams } from '../types';
@Component({
    selector: 'app-server-display',
    templateUrl: './server-display.component.html',
    styleUrls: ['./server-display.component.scss'],
})
export class ServerDisplayComponent {
    constructor(public serverDataService: ServerDataService) {}

    disableCards = false;

    isSignedIn$ = this.serverDataService.isSignedIn.subscribe((isSignedIn) => {
        if (isSignedIn) {
            this.refreshCards();
        } else {
            this.serverDataService.showLoadingPane.next(false);
        }
    });

    async refreshCards() {
        this.serverDataService.showLoadingPane.next(true);
        await this.serverDataService.fetchData();
        this.serverDataService.showLoadingPane.next(false);
    }

    async onCardButtonClick(query: QueryParams) {
        this.disableCards = true;
        await this.serverDataService.sendCommand(query);
        this.disableCards = false;
    }
}
