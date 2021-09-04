import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


/**
 * A Service that allows other components to change the title of {@link AppComponent}
 * */
@Injectable({
    providedIn: 'root',
})
export class TitleService {
    title = new Subject<string>();

    public setTitle(title: string) {
        this.title.next(title);
    }
}
