import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestComponent } from './test/test.component';
import { ServerSelectComponent } from './server-select/server-select.component';
import { LoginService } from './services/firebase.service';
import { LoginComponent } from './server-select/login/login.component';
import { ServerCardComponent } from './server-select/server-card/server-card.component';
import { PowerIconComponent } from './server-select/server-card/power-icon/power-icon.component';
import { RefreshIconComponent } from './server-select/refresh-icon/refresh-icon.component';

@NgModule({
    declarations: [
        AppComponent,
        TestComponent,
        ServerSelectComponent,
        LoginComponent,
        ServerCardComponent,
        PowerIconComponent,
        RefreshIconComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatToolbarModule,
        MatButtonModule,
        MatCardModule,
        MatInputModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        MatProgressSpinnerModule,
    ],
    providers: [LoginService, HttpClient],
    bootstrap: [AppComponent],
})
export class AppModule {}
