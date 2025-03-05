import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobApplicationService } from '../../services/job-application.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-job-application-form',
  imports: [ CommonModule, ReactiveFormsModule, FormsModule ],
  templateUrl: './job-application-form.component.html',
  styleUrl: './job-application-form.component.scss'
})
export class JobApplicationFormComponent implements OnInit {

  jobApplicationForm: FormGroup;
  jobApplications: JobApplication []= [];
  filterText: string = '';

  constructor( private fb: FormBuilder, private jobApplicationService: JobApplicationService) {
    this.jobApplicationForm = this.fb.group({
      jobName: ['', Validators.required],
      jobDescription: ['', Validators.required],
      jobLink: ['', Validators.required],
      stage: ['', Validators.required],
      status: ['Pendente', Validators.required],
      reminder: [''],
      reminderDescription: ['']
    })
  }


  ngOnInit(): void{
    this.loadJobApplications();
  }

  loadJobApplications(): void {
    this.jobApplicationService.getJobApplications().subscribe((applications) => {
      this.jobApplications = applications;
    });
  }

  onSubmit(): void {
    if(this.jobApplicationForm.valid){
      const newApplication: JobApplication = {
        ...this.jobApplicationForm.value,
        date: new Date()
    };
    this.jobApplicationService.addJobApplication(newApplication).subscribe(() => {
      this.jobApplicationForm.reset({ status: 'Pendente' });
      this.loadJobApplications();
    });
   }
  }

  filterApplications(): void {
    this.jobApplicationService.getJobApplications().subscribe((applications) => {
      this.jobApplications = applications.filter(application =>
        application.jobName.toLowerCase().includes(this.filterText.toLocaleLowerCase()) || application.jobDescription.toLowerCase().includes(this.filterText.toLowerCase())
      );
    });
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
