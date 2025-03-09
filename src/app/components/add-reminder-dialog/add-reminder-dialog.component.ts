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
    @Inject(MAT_DIALOG_DATA) public data: { jobApplication?: JobApplication, date?: Date, reminder?: Reminder, isEditing: boolean }
  ) {}

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
      date: [this.formatDateForInput(presetDate), Validators.required]
    };


    if (this.data.isEditing) {
      formConfig.completed = [reminder?.completed || false];
    }

    this.reminderForm = this.fb.group(formConfig);
  }

  formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    const tzoffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
  }

  onSubmit(): void {
    if (this.reminderForm.valid) {
      const formValues = this.reminderForm.value;


      const reminderData: any = {
        title: formValues.title,
        description: formValues.description,
        date: new Date(formValues.date).toISOString()
      };


      if (this.data.jobApplication && this.data.jobApplication.id) {
        reminderData.jobApplicationId = this.data.jobApplication.id;
      } else if (this.data.reminder?.jobApplicationId) {
        reminderData.jobApplicationId = this.data.reminder.jobApplicationId;
      }


      if (this.data.isEditing && formValues.completed !== undefined) {
        reminderData.completed = formValues.completed;
      }

      if (this.data.isEditing && this.data.reminder && typeof this.data.reminder.id === 'number') {
        this.reminderService.updateReminder(this.data.reminder.id, reminderData)
          .subscribe({
            next: () => {
              this.snackBar.open('Lembrete atualizado com sucesso', 'Fechar', { duration: 3000 });
              this.dialogRef.close(true);
            },
            error: (err) => {
              console.error('Erro ao atualizar lembrete:', err);
              this.snackBar.open('Erro ao atualizar lembrete', 'OK', { duration: 3000 });
            }
          });
      } else {
        this.reminderService.addReminder(reminderData)
          .subscribe({
            next: () => {
              this.snackBar.open('Lembrete criado com sucesso', 'Fechar', { duration: 3000 });
              this.dialogRef.close(true);
            },
            error: (err) => {
              console.error('Erro ao criar lembrete:', err);
              this.snackBar.open('Erro ao criar lembrete', 'OK', { duration: 3000 });
            }
          });
      }
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
