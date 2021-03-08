import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TitleService {
    title = new Subject<string>();
    title$ = this.title.asObservable();

    public setTitle(title: string) {
        this.title.next(title);
    }
}
