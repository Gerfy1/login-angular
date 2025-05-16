import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobApplicationService } from '../../services/job-application.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { Reminder } from '../../models/reminder.model';
import { ReminderService } from '../../services/reminder.service';
import { ApplicationStage, ApplicationStatus } from '../job-aplication-list/job-aplication-list.component';


@Component({
  selector: 'app-job-application-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './job-application-form.component.html',
  styleUrl: './job-application-form.component.scss'
})
export class JobApplicationFormComponent implements OnInit {

  jobApplicationForm: FormGroup;
  stages = Object.values(ApplicationStage);
  statuses = Object.values(ApplicationStatus);


  constructor(private fb: FormBuilder, private jobApplicationService: JobApplicationService, private reminderService: ReminderService) {
    this.jobApplicationForm = this.fb.group({
      jobName: ['', Validators.required],
      jobDescription: ['', Validators.required],
      jobLink: ['', Validators.required],
      stage: ['Inscrito', Validators.required],
      status: ['Pendente', Validators.required],
      reminder: [''],
      reminderDescription: [''],
      reminderDate: ['']
    })
  }


  ngOnInit(): void {

  }


  onSubmit(): void {
    const userId = sessionStorage.getItem('user-id');
    const username = sessionStorage.getItem('username');
    if (userId && username) {
      const user: User = { id: parseInt(userId, 10), username: username };
      if (this.jobApplicationForm.valid) {
        const formValues = this.jobApplicationForm.value;

        const newApplication: JobApplication = {
          jobName: formValues.jobName,
          jobDescription: formValues.jobDescription,
          jobLink: formValues.jobLink,
          stage: formValues.stage,
          status: formValues.status,
          date: new Date(),
          user: user
        };

        const reminderValue = formValues.reminder;
        const reminderDescription = formValues.reminderDescription;

        console.log('New application:', newApplication);
        this.jobApplicationService.addJobApplication(newApplication).subscribe({
          next: (response) => {
            console.log('Job application created successfully', response);
            if (reminderValue && response && response.id) {
              const reminderData = {
                title: `Lembrete para ${formValues.jobName}`,
                description: reminderDescription || `Lembrete para a vaga ${formValues.jobName}`,
                date: reminderValue,
                jobApplicationId: response.id as number,
                completed: false
              };

              this.reminderService.addReminder(reminderData).subscribe({
                next: (reminderResponse) => {
                  console.log('Lembrete criado', reminderResponse);
                },
                error: (reminderError) => {
                  console.error('Error creating reminder', reminderError);
                }
              });
            }
            this.jobApplicationForm.reset({ status: 'Pendente' });
          },
          error: (error) => {
            console.error('Erro ao criar:', error);
          }
        });
      } else {
        console.log('Formulario invalido');
        this.logFormErrors();
      }
    } else {
      console.error('User ID ou username faltando');
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
