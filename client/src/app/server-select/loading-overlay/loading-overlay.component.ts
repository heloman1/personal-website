import { Component } from '@angular/core';

@Component({
    selector: 'app-loading-overlay',
    template: `
        <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
        <p>This may take a while...</p>
    `,
    styleUrls: ['./loading-overlay.component.scss'],
})
export class LoadingOverlayComponent {}
