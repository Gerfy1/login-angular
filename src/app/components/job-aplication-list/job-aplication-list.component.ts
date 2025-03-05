import { Component, OnInit } from '@angular/core';
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationService } from '../../services/job-application.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-aplication-list',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './job-aplication-list.component.html',
  styleUrl: './job-aplication-list.component.scss'
})
export class JobAplicationListComponent implements OnInit{

  jobApplications: JobApplication[] = [];
  filterText: string = '';

  constructor(private jobApplicationService: JobApplicationService) {}


  ngOnInit(): void {
    this.loadJobApplications();
  }

  loadJobApplications(): void {
    console.log('Loading job applications...');
    this.jobApplicationService.getJobApplications().subscribe(
      (applications) => {
        console.log('Job applications loaded:', applications);
        this.jobApplications = applications;
      },
      (error) => {
        console.error('Error loading job applications:', error);
      }
    );
  }

  filterApplications(): void {
    this.jobApplications = this.jobApplications.filter(application =>
      application.jobName.toLowerCase().includes(this.filterText.toLowerCase()) ||
      application.jobDescription.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  updateStatus(application: JobApplication, status: string): void {
    if (application.id !== undefined) {
      this.jobApplicationService.updateJobApplicationStatus(application.id, status).subscribe(() => {
        this.loadJobApplications();
      });
    } else {
      console.error('Application ID is undefined');
    }
  }

  addReminder(application: JobApplication): void {
    //  next
  }
}
