import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TitleService } from './services/title.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
    title = '';
    titleSubscription: Subscription;
    constructor(private title_service: TitleService) {
        this.titleSubscription = this.title_service.title$.subscribe(
            (title) => {
                this.title = title;
            }
        );
    }

    ngOnDestroy() {
        this.titleSubscription.unsubscribe();
    }
}
