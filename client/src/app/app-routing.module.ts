import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './server-select/login/login.component';
import { ServerSelectComponent } from './server-select/server-select.component';
const routes: Routes = [
    { path: 'servers', component: ServerSelectComponent },
    { path: 'servers/login', component: LoginComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
