import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { JobApplicationFormComponent } from '../../components/job-application-form/job-application-form.component';

@Component({
  selector: 'app-job-applications-page',
  imports: [SidebarComponent, HeaderComponent, JobApplicationFormComponent],
  templateUrl: './job-applications-page.component.html',
  styleUrl: './job-applications-page.component.scss'
})
export class JobApplicationsPageComponent {

}
