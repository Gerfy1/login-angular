import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JobApplication } from '../../models/job-application.model';
import { ReminderService } from '../../services/reminder.service';
import { ReminderCreate } from '../../models/reminder-create.model';
import { Reminder } from '../../models/reminder.model';

@Component({
  selector: 'app-add-reminder-dialog',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-reminder-dialog.component.html',
  styleUrl: './add-reminder-dialog.component.scss'
})
export class AddReminderDialogComponent {

  reminderForm: FormGroup;
  isEditing = false;
  reminderId?: number;

  constructor(
    private fb: FormBuilder,
    private reminderService: ReminderService,
    private dialogRef: MatDialogRef<AddReminderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { jobApplication: JobApplication, date?: Date, reminder?: Reminder, isEditing: boolean }
  )
  {
    let presetDate = data.date ? data.date : null;

  if (data.isEditing && data.reminder) {
    presetDate = new Date(data.reminder.date);

    this.reminderForm = this.fb.group({
      title: [data.reminder.title, Validators.required],
      description: [data.reminder.description || ''],
      date: [presetDate, Validators.required]
    });

    this.isEditing = true;
    this.reminderId = data.reminder.id;
  } else {
    this.reminderForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      date: [presetDate, Validators.required]
    });
  }
}

onSubmit(): void {
  if (this.reminderForm.valid) {
    const localDate = new Date(this.reminderForm.value.date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

    const reminderData = {
      title: this.reminderForm.value.title,
      description: this.reminderForm.value.description || '',
      date: formattedDate,
      completed: this.isEditing ? (this.data.reminder?.completed || false) : false,
      jobApplicationId: this.data.jobApplication.id as number
    };

    if (this.isEditing && this.reminderId) {
      this.reminderService.updateReminder(this.reminderId, reminderData).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Erro ao atualizar lembrete:', error);
        }
      });
    } else {
      this.reminderService.addReminder(reminderData).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Erro ao adicionar lembrete:', error);
        }
      });
    }
  }
}

  cancel(): void {
    this.dialogRef.close(false);
  }
}
