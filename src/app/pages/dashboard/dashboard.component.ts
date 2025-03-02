import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { JobsComponent } from '../../components/jobs/jobs.component';



@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, SidebarComponent, HeaderComponent, JobsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
