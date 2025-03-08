import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JobApplication } from '../../models/job-application.model';
import { ReminderService } from '../../services/reminder.service';

@Component({
  selector: 'app-add-reminder-dialog',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-reminder-dialog.component.html',
  styleUrl: './add-reminder-dialog.component.scss'
})
export class AddReminderDialogComponent {

  reminderForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reminderService: ReminderService,
    private dialogRef: MatDialogRef<AddReminderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { jobApplication: JobApplication, date?: Date }
  )
  {
    const presetDate = data.date ? data.date : null;

    this.reminderForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      date: [presetDate, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.reminderForm.valid){
      const reminder = {
        title: this.reminderForm.value.title,
        description: this.reminderForm.value.description,
        date: new Date(this.reminderForm.value.date),
        completed: false,
        jobApplicationId: this.data.jobApplication.id as number
      };

      console.log('Enviando lembrete:', reminder);

      this.reminderService.addReminder(reminder).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Erro adding reminder:' + error);
        }
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

}
