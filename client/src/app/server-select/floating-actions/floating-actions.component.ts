import { Component } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { ServerDataService } from '../serverdata.service';

@Component({
    selector: 'app-floating-actions',
    templateUrl: './floating-actions.component.html',
    styleUrls: ['./floating-actions.component.scss'],
})
export class FloatingActionsComponent {
    constructor(
        private serverDataService: ServerDataService,
        private loginService: LoginService
    ) {}

    get statusText$() {
        return this.serverDataService.statusText;
    }

    get isSignedIn$() {
        return this.loginService.isSignedIn;
    }

    async signOut() {
        await this.loginService.signOut();
        window.location.reload();
    }

    refreshCards() {
        this.serverDataService.fetchData();
    }
}
