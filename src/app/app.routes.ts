import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [{
  path: "login",
  component: LoginComponent
},
{
  path: "register",
  component: SignupComponent
},
{
  path: '', redirectTo: '/login', pathMatch: 'full'
},
{
  path: '**', redirectTo: '/login'
}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
