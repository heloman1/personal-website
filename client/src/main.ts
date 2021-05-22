import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));

setTimeout(() => {
    // Delay transitions so I don't blinded when refreshing
    const sheet =
        window.document.styleSheets[window.document.styleSheets.length - 1];

    sheet.insertRule('.text {transition: color 0.5s ease;}');
    sheet.insertRule('* {transition: all 0.5s ease;}');
    sheet.insertRule(
        'html,body,app-root {transition: background-color 0.5s ease;}'
    );
}, 1000);
