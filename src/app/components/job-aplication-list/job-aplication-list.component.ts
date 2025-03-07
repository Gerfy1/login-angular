import { Component, OnInit } from '@angular/core';
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationService } from '../../services/job-application.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { MatDialog } from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import { AddReminderDialogComponent } from '../add-reminder-dialog/add-reminder-dialog.component';

@Component({
  selector: 'app-job-aplication-list',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './job-aplication-list.component.html',
  styleUrl: './job-aplication-list.component.scss'
})
export class JobAplicationListComponent implements OnInit{

  jobApplications: JobApplication[] = [];
  filteredApplications: JobApplication[] = [];
  filterText: string = '';


  private subscription: Subscription | null = null;
  constructor(private jobApplicationService: JobApplicationService, private eventService: EventService, private dialog: MatDialog, private snackbar:MatSnackBar) {}


  ngOnInit(): void {
    this.loadJobApplications();
    this.subscription = this.eventService.jobApplicationAdded$.subscribe(
      newApplication => {
        console.log('New application added:', newApplication);
        this.jobApplications.push(newApplication);
        this.applyFilter();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadJobApplications(): void {
    console.log('Loading job applications...');
    this.jobApplicationService.getJobApplications().subscribe(
      (applications) => {
        console.log('Job applications loaded:', applications);
        this.jobApplications = applications;
        this.applyFilter();
      },
      (error) => {
        console.error('Error loading job applications:', error);
      }
    );
  }

  applyFilter(): void {
    if (!this.filterText || this.filterText.trim() === '') {
      this.filteredApplications = [...this.jobApplications];
    } else {
      this.filteredApplications = this.jobApplications.filter(application =>
        application.jobName.toLowerCase().includes(this.filterText.toLowerCase()) ||
        application.jobDescription.toLowerCase().includes(this.filterText.toLowerCase())
      );
    }
  }
  onFilterTextChange(): void {
    this.applyFilter();
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
    const dialogRef = this.dialog.open(AddReminderDialogComponent, {
      width: '500px',
      data: { jobApplication: application }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackbar.open('Lembre adicionado com sucesso!', 'Close', {
          duration: 3000
        });
      }
    });
  }
}
