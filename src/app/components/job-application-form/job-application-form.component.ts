import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobApplicationService } from '../../services/job-application.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-job-application-form',
  imports: [ CommonModule, ReactiveFormsModule, FormsModule ],
  templateUrl: './job-application-form.component.html',
  styleUrl: './job-application-form.component.scss'
})
export class JobApplicationFormComponent implements OnInit {

  jobApplicationForm: FormGroup;


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

  }


  onSubmit(): void {
    console.log('Form submitted');
    const userId = sessionStorage.getItem('user-id');
    const username = sessionStorage.getItem('username');
    if (userId && username) {
      const user: User = { id: parseInt(userId, 10), username: username };
      if (this.jobApplicationForm.valid) {
        const newApplication: JobApplication = {
          ...this.jobApplicationForm.value,
          date: new Date(),
          user: user
        };
        console.log('New application:', newApplication);
        this.jobApplicationService.addJobApplication(newApplication).subscribe(
          (response) => {
            console.log('Job application created successfully', response);
            this.jobApplicationForm.reset({ status: 'Pendente' });
          },
          (error) => {
            console.error('Error creating job application', error);
          }
        );
      } else {
        console.log('Form is invalid');
        this.logFormErrors();
      }
    } else {
      console.error('User ID or username is missing');
    }
  }

  logFormErrors(): void {
    Object.keys(this.jobApplicationForm.controls).forEach(key => {
      const controlErrors = this.jobApplicationForm.get(key)?.errors;
      if (controlErrors != null) {
        console.log(`Key: ${key}, Errors:`, controlErrors);
      }
    });
  }

}
