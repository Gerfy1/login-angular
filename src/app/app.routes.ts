import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { JobAplicationListComponent } from './components/job-aplication-list/job-aplication-list.component';
import { JobApplicationFormComponent } from './components/job-application-form/job-application-form.component';
import { NgModule } from '@angular/core';
import { DashboardHomeComponent } from './pages/dashboard-home/dashboard-home.component';
import { JobApplicationsPageComponent } from './pages/job-applications-page/job-applications-page.component';
import { AuthGuard } from './guards/auth.guard';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { ChangelogComponent } from './pages/info/changelog/changelog.component';
import { AboutComponent } from './pages/info/about/about.component';
import { ContactComponent } from './pages/info/contact/contact.component';

export const routes: Routes = [
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "register",
    component: SignupComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'job-applications', component: JobAplicationListComponent },
      { path: 'applications', component: JobAplicationListComponent },
      { path: 'applications/new', component: JobApplicationFormComponent },
      { path: 'applications/:id', component: JobApplicationFormComponent },
      { path: 'profile', component: UserProfileComponent },
      { path: 'calendar', component: CalendarPageComponent },
      { path: 'changelog', component: ChangelogComponent},
      { path: 'about', component: AboutComponent},
      { path: 'contact', component: ContactComponent}
    ]
  },
  {
    path: 'job-applications',
    component: JobApplicationsPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path:'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'calendar',
    component: CalendarPageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
