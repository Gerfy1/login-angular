import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JobApplicationListComponent } from './components/job-application-list/job-application-list.component';
import { JobApplicationFormComponent } from './components/job-application-form/job-application-form.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [{
  path: "login",
  component: LoginComponent
},
{
  path: "register",
  component: SignupComponent
},
{ path: 'dashboard', component: DashboardComponent, children: [
  { path: 'applications', component: JobApplicationListComponent },
  { path: 'applications/new', component: JobApplicationFormComponent },
  { path: 'applications/:id', component: JobApplicationFormComponent },
  { path: 'profile', component: ProfileComponent },
]}
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
