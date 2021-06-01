import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { BadRouteComponent } from './bad-route/bad-route.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './server-select/login/login.component';
import { ServerSelectComponent } from './server-select/server-select.component';
import { ServerDisplayComponent } from './server-select/server-display/server-display.component';
const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    {
        path: 'servers',
        component: ServerSelectComponent,
        children: [
            { path: 'login', component: LoginComponent },
            { path: '', component: ServerDisplayComponent },
        ],
    },
    { path: '**', pathMatch: 'full', component: BadRouteComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
