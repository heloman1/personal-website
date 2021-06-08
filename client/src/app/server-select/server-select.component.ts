import { Component, OnDestroy } from '@angular/core';
import { TitleService } from '../services/title.service';
import { ServerDataService } from './serverdata.service';

@Component({
    selector: 'app-server-select',
    templateUrl: './server-select.component.html',
    styleUrls: ['./server-select.component.scss'],
})
export class ServerSelectComponent implements OnDestroy {
    constructor(
        private title: TitleService,
        private serverDataService: ServerDataService
    ) {
        this.title.setTitle('Server Panel');
    }

    get showLoadingPane$() {
        return this.serverDataService.isLoading;
    }

    ngOnDestroy() {
        this.title.setTitle('');
    }
}
