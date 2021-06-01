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
        private title: TitleService,
        private serverDataService: ServerDataService
    ) {}

    showLoadingPane = true;
    showLoadingPane$ = this.serverDataService.showLoadingPane.subscribe(
        (bool) => {
            this.showLoadingPane = bool;
        }
    );

    ngOnInit(): void {
        this.title.setTitle('Server Panel');
    }

    ngOnDestroy() {
        this.title.setTitle('');
    }
}
