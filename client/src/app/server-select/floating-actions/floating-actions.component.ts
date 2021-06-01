import { Component, Input } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { ServerDataService } from '../serverdata.service';

@Component({
    selector: 'app-floating-actions',
    templateUrl: './floating-actions.component.html',
    styleUrls: ['./floating-actions.component.scss'],
})
export class FloatingActionsComponent {
    constructor(
        public serverDataService: ServerDataService,
        private loginService: LoginService
    ) {}

    @Input() isSignedIn = false;
    isSignedIn$ = this.serverDataService.isSignedIn.subscribe(
        (bool) => (this.isSignedIn = bool)
    );

    async signOut() {
        await this.loginService.signOut();
        window.location.reload();
    }

    async refreshCards() {
        this.serverDataService.showLoadingPane.next(true);
        await this.serverDataService.fetchData();
        this.serverDataService.showLoadingPane.next(false);
    }
}
