import { Component, Input, OnDestroy } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Subscription } from 'rxjs';
import { TitleService } from './services/title.service';

const THEME_KEY = 'IsDarkTheme';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
    title = '';
    titleSubscription: Subscription;
    slideToggleState: boolean;
    constructor(private title_service: TitleService) {
        this.titleSubscription = this.title_service.title$.subscribe(
            (title) => {
                this.title = title;
            }
        );
        const IsDarkTheme = window.localStorage.getItem(THEME_KEY);
        if (!IsDarkTheme) {
            this.slideToggleState = false;
            this.changeTheme(false);
        } else {
            this.slideToggleState = true;
            this.changeTheme(true);
        }
    }

    changeTheme(dark: boolean) {
        if (dark) {
            document.documentElement.className = 'dark-theme';
            this.slideToggleState = true;
            window.localStorage.setItem(THEME_KEY, 'yes');
        } else {
            document.documentElement.className = '';
            this.slideToggleState = false;
            window.localStorage.removeItem(THEME_KEY);
        }
    }

    onSlideToggle(dark: MatSlideToggleChange) {
        this.changeTheme(dark.checked);
    }
    ngOnDestroy() {
        this.titleSubscription.unsubscribe();
    }
}
