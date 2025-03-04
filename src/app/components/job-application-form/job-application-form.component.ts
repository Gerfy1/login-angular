import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobApplicationService } from '../../services/job-application.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-application-form',
  imports: [ CommonModule, ReactiveFormsModule, FormsModule ],
  templateUrl: './job-application-form.component.html',
  styleUrl: './job-application-form.component.scss'
})
export class JobApplicationFormComponent implements OnInit {

  jobApplicationForm: FormGroup;
  jobApplications: any = [];
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
    this.jobApplications = this.jobApplicationService.getJobApplications();
  }

  onSubmit(): void {
    if (this.jobApplicationForm.valid){
      const newApplication = {
        ...this.jobApplicationForm.value,
        date: new Date(),
        id: Date.now()
      };
      this.jobApplicationService.addJobApplication(newApplication);
      this.jobApplicationForm.reset({status: 'Pendente'});
      this.loadJobApplications();
    }
  }

  filterApplications(): void {
    this.jobApplications = this.jobApplicationService.getJobApplications(this.filterText);
  }

  updateStatus(application: any, status: string): void{
    this.jobApplicationService.updateJobApplicationStatus(application.id, status);
    this.loadJobApplications();
  }

  addReminder(application: any): void {
    //  next
  }

}
