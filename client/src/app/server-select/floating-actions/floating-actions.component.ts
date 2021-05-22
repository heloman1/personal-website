import { Component, EventEmitter, Input, Output } from '@angular/core';
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
    @Input() signedIn = false;
    @Output() doneLoading = new EventEmitter<boolean>();
    async signOut() {
        await this.loginService.signOut();
        window.location.reload();
    }

    async refreshCards() {
        this.doneLoading.emit(false);
        await this.serverDataService.fetchData();
        this.doneLoading.emit(true);
    }
}
