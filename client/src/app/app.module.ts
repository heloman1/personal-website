import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';

import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServerSelectComponent } from './server-select/server-select.component';
import { LoginService } from './services/firebase.service';
import { LoginComponent } from './server-select/login/login.component';
import { ServerCardComponent } from './server-select/server-card/server-card.component';
import { PowerIconComponent } from './icons/power-icon/power-icon.component';
import { RefreshIconComponent } from './icons/refresh-icon/refresh-icon.component';
import { TitleService } from './services/title.service';
import { BadRouteComponent } from './bad-route/bad-route.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';

@NgModule({
    declarations: [
        AppComponent,
        ServerSelectComponent,
        LoginComponent,
        ServerCardComponent,
        PowerIconComponent,
        RefreshIconComponent,
        BadRouteComponent,
        HomeComponent,
        AboutComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        MatToolbarModule,
        MatButtonModule,
        MatCardModule,
        MatInputModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatProgressSpinnerModule,
    ],
    providers: [LoginService, HttpClient, TitleService],
    bootstrap: [AppComponent],
})
export class AppModule {}
