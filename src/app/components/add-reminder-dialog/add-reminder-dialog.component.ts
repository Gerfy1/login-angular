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
      this.data.date ? this.data.date :
        new Date();

    let presetDate: Date;
    if (reminder && reminder.date instanceof Date) {
      presetDate = reminder.date;
      console.log("AddReminderDialog - Usando reminder.date existente:", presetDate);
    } else if (reminder && reminder.date) {
      presetDate = new Date(reminder.date);
      console.warn("AddReminderDialog - reminder.date não era um objeto Date, tentando converter:", reminder.date, "Resultado:", presetDate);
    } else if (this.data.date) {
      presetDate = this.data.date;
      console.log("AddReminderDialog - Usando data.date:", presetDate);
    } else {
      presetDate = new Date();
      console.log("AddReminderDialog - Usando data atual:", presetDate);
    }
    const formattedPresetDate = !isNaN(presetDate.getTime()) ? this.formatDateForInput(presetDate) : '';
    if (formattedPresetDate === '') {
        console.error("AddReminderDialog - presetDate resultou em data inválida!");
    }

    this.isEditing = this.data.isEditing || false;
    if (reminder && reminder.id) {
      this.reminderId = reminder.id;
    }

    let initialJobApplicationId: number | string = '';
    if (this.isEditing && reminder) {
        initialJobApplicationId = reminder.jobApplication?.id || this.data.jobApplication?.id || '';
        console.log(`Editando: initialJobApplicationId definido como ${initialJobApplicationId} (de reminder.jobApplication?.id ou data.jobApplication?.id)`);
    } else if (this.data.jobApplication?.id) {
        initialJobApplicationId = this.data.jobApplication.id;
        console.log(`Criando (com vaga): initialJobApplicationId definido como ${initialJobApplicationId} (de data.jobApplication.id)`);
    } else if (!this.data.requireJobSelection && this.data.jobApplications && this.data.jobApplications.length > 0) {
        console.log('Criando (sem vaga específica, seleção não obrigatória): initialJobApplicationId deixado vazio.');
    } else {

         console.log('Criando (sem vaga específica, seleção obrigatória): initialJobApplicationId deixado vazio.');
    }

    const initialTitle = reminder?.title || '';
    console.log("AddReminderDialog - Título inicial:", initialTitle);

    const formConfig: any = {
      title: [reminder?.title || '', Validators.required],
      description: [reminder?.description || ''],
      date: [formattedPresetDate, Validators.required],
      jobApplicationId: [initialJobApplicationId, Validators.required]
    };


    this.reminderForm = this.fb.group(formConfig);

}

  formatDateForInput(date: Date): string {
    const d = date instanceof Date ? date : new Date(date);
    if (!(date instanceof Date) || isNaN(date.getTime())){
      console.error("Data inválida recebida em formatDateForInput:", date);
      const now = new Date();
      const tzoffset = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
    }
   const tzoffset = d.getTimezoneOffset() * 60000;
   const localISOTime = new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
   return localISOTime;
 }

  onSubmit(): void {
    if (this.reminderForm.valid) {
      const formData = this.reminderForm.value;
      const dateString = formData.date;
      const jobApplicationId = this.reminderForm.get('jobApplicationId')?.value;


      const reminderData: ReminderCreate = {
        title: formData.title,
        description: formData.description || '',
        date: dateString,
        jobApplicationId: jobApplicationId,
      };

      console.log(`AddReminderDialog - onSubmit: isEditing=${this.isEditing}, reminderId=${this.reminderId}`);

      if (this.isEditing && this.reminderId) {
        console.log(`Chamando updateReminder com ID: ${this.reminderId}`, reminderData);
        this.reminderService.updateReminder(this.reminderId, reminderData).subscribe({
          next: (updatedReminder) => {
            this.snackBar.open('Lembrete atualizado com sucesso!', 'Fechar', { duration: 3000 });
            this.dialogRef.close(updatedReminder);
          },
          error: (error) => {
            console.error('Erro ao atualizar lembrete:', error);
            this.snackBar.open('Erro ao atualizar lembrete.', 'Fechar', { duration: 5000 });
          }
        });
      } else {
        console.log(`Chamando addReminder`, reminderData);
        this.reminderService.addReminder(reminderData).subscribe({
          next: (newReminder) => {
            this.snackBar.open('Lembrete criado com sucesso!', 'Fechar', { duration: 3000 });
            this.dialogRef.close(newReminder);
          },
          error: (error) => {
            console.error('Erro ao criar lembrete:', error);
            const errorMsg = error?.error?.message || 'Erro ao criar lembrete. Tente novamente.';
            this.snackBar.open(errorMsg, 'Fechar', { duration: 5000 });
          }
        });
      }
    } else {
      console.warn('Formulário inválido:', this.reminderForm.errors);
      this.reminderForm.markAllAsTouched();
      this.snackBar.open('Por favor, preencha os campos obrigatórios.', 'Fechar', { duration: 3000 });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
