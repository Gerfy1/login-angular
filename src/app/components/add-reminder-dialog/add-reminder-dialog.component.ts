import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JobApplication } from '../../models/job-application.model';
import { ReminderService } from '../../services/reminder.service';
import { ReminderCreate } from '../../models/reminder-create.model';
import { Reminder } from '../../models/reminder.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-reminder-dialog',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-reminder-dialog.component.html',
  styleUrl: './add-reminder-dialog.component.scss'
})
export class AddReminderDialogComponent implements OnInit {

  reminderForm!: FormGroup;
  isEditing = false;
  reminderId?: number;

  constructor(
    private fb: FormBuilder,
    private reminderService: ReminderService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddReminderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { jobApplication?: JobApplication, date?: Date, reminder?: Reminder, isEditing: boolean, jobApplications?: JobApplication[], requireJobSelection?: boolean }
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    const reminder = this.data.isEditing ? this.data.reminder : null;
    const presetDate = reminder ? new Date(reminder.date) :
      this.data.date ? this.data.date :
        new Date();

    this.isEditing = this.data.isEditing || false;
    if (reminder) {
      this.reminderId = reminder.id;
    }


    const formConfig: any = {
      title: [reminder?.title || '', Validators.required],
      description: [reminder?.description || ''],
      date: [this.formatDateForInput(presetDate), Validators.required],
      jobApplicationId: ['', Validators.required]
    };


    this.reminderForm = this.fb.group(formConfig);


    if (reminder?.jobApplicationId) {
      this.reminderForm.get('jobApplicationId')?.setValue(reminder.jobApplicationId);
    } else if (this.data.jobApplication?.id) {
      this.reminderForm.get('jobApplicationId')?.setValue(this.data.jobApplication.id);
    } else if (this.data.jobApplications && this.data.jobApplications.length > 0) {

      this.reminderForm.get('jobApplicationId')?.setValue(this.data.jobApplications[0].id);


      console.log('Definindo jobApplicationId padrão:', this.data.jobApplications[0].id);
    }
  }

  formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    const tzoffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
  }

  onSubmit(): void {
    if (this.reminderForm.valid) {
      const formData = this.reminderForm.value;

      let reminderDate: Date;
      if (formData.date instanceof Date) {
        reminderDate = formData.date;
      } else {
        reminderDate = new Date(formData.date);
      }

      const jobApplicationId = this.reminderForm.get('jobApplicationId')?.value;

      const reminderData = {
        title: formData.title,
        description: formData.description || '',
        date: reminderDate.toISOString(),
        jobApplicationId: jobApplicationId,
        completed: false
      };

      console.log('Enviando lembrete:', reminderData);

      this.reminderService.addReminder(reminderData).subscribe({
        next: (response) => {
          this.snackBar.open('Lembrete criado com sucesso!', 'Fechar', {
            duration: 3000
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Erro ao criar lembrete:', error);
          this.snackBar.open('Erro ao criar lembrete. Por favor, tente novamente.', 'Fechar', {
            duration: 5000
          });
        }
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
