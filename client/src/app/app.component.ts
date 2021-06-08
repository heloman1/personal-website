import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TitleService } from './services/title.service';

const THEME_KEY = 'IsDarkTheme';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = this.title_service.title;
    slideToggleState: boolean;
    constructor(private title_service: TitleService) {
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

    areWeOnPage(path: string) {
        return window.location.pathname == path;
    }
}
