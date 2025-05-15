import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { CommonModule, registerLocaleData } from '@angular/common';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { ReminderService } from '../../services/reminder.service';
import { Reminder } from '../../models/reminder.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JobApplicationService } from '../../services/job-application.service';
import { MatDialog } from '@angular/material/dialog';
import { AddReminderDialogComponent } from '../add-reminder-dialog/add-reminder-dialog.component';
import { isSameDay,isSameMonth } from 'date-fns';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReminderDetailsDialogComponent } from '../reminder-details-dialog/reminder-details-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { trigger, style, transition, animate } from '@angular/animations';
import localePt from '@angular/common/locales/pt';
import { ptBR } from 'date-fns/locale';
import { JobApplication } from '../../models/job-application.model';

  registerLocaleData(localePt);


@Component({
  selector: 'app-calendar',
  imports: [CommonModule, CalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  animations: [
    trigger('collapse', [
      transition('void => *', [
        style({ height: '0', overflow: 'hidden' }),
        animate('150ms', style({ height: '*' }))
      ]),
      transition('* => void', [
        style({ height: '*', overflow: 'hidden' }),
        animate('150ms', style({ height: '0' }))
      ])
    ])
  ]
})
export class CalendarComponent implements OnInit, OnDestroy{

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = false;
  clickedDate: Date | null = null;
  refresh = new Subject<void>();
  locale: string = 'pt-BR';
  locale: string = 'pt-BR';
  private destroy$ = new Subject<void>();

  constructor(private reminderService: ReminderService, private dialog: MatDialog, private jobApplicationService: JobApplicationService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.reminderService.loadReminders();
    this.subscribeToReminders();
    this.loadReminders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToReminders(): void {
    this.reminderService.getReminders()
     .pipe(takeUntil(this.destroy$))
     .subscribe(reminders => {
       console.log('Reminders recebidos (Calendar):', reminders);
       this.events = reminders.map(reminder => this.mapReminderToEvent(reminder));
       console.log('Events mapeados para o calendário (Calendar):', this.events);
       this.refresh.next();
     });
 }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;

        if (events.length === 0) {
          this.openAddReminderDialogForDate(date);
        }
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  loadReminders(): void {
    this.reminderService.getReminders()
      .pipe(takeUntil(this.destroy$))
      .subscribe(reminders => {
        console.log('Reminders recebidos:', reminders);
        this.events = reminders.map(reminder => this.mapReminderToEvent(reminder));
        console.log('Events mapeados para o calendário:', this.events);
        this.refresh.next();
      });
  }

  openAddReminderDialog(): void {
    this.jobApplicationService.getJobApplications().subscribe(applications => {
      if (applications.length === 0) {
        this.snackBar.open('Você precisa ter pelo menos uma candidatura registrada para adicionar um lembrete', 'OK', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['warning-snackbar']
        });
        return;
      }

      const dialogRef = this.dialog.open(AddReminderDialogComponent, {
        width: '400px',
        data: {
          date: new Date(),
          jobApplications: applications,
          requireJobSelection: true,
          isEditing: false
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.loadReminders();
        }
      });
    });
  }

  openAddReminderDialogForDate(date: Date): void {
    this.jobApplicationService.getJobApplications().subscribe({
      next: (applications) => {
        if (applications.length === 0) {
          this.snackBar.open('Você precisa ter pelo menos uma candidatura registrada para adicionar um lembrete', 'OK', {
            duration: 5000
          });
          return;
        }

        const dialogRef = this.dialog.open(AddReminderDialogComponent, {
          width: '400px',
          data: {
            date: date,
            jobApplications: applications,
            requireJobSelection: true,
            isEditing: false
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.loadReminders();
          }
        });
      },
      error: (error) => {
        console.error('Erro ao carregar candidaturas:', error);
        this.snackBar.open('Erro ao carregar candidaturas. Por favor, tente novamente.', 'OK', {
          duration: 5000
        });
      }
    });
  }

  private mapReminderToEvent(reminder: Reminder): CalendarEvent {
    if (!(reminder.date instanceof Date)) {
      console.warn(`Reminder ${reminder.id}: reminder.date não é um objeto Date!`, reminder.date);
      reminder.date = new Date(reminder.date);
      if (isNaN(reminder.date.getTime())) {
        console.error(`Falha ao converter data para o lembrete ID ${reminder.id}. Usando data atual como fallback.`);
        reminder.date = new Date();
      }
    }
    return {
      id: reminder.id,
      title: reminder.title,
      start: reminder.date,
      allDay: false,
      color: reminder.color ||{
        primary: '#1976d2',
        secondary: '#e3f2fd'
      },
      meta: reminder
    };
  }

  setView(view: CalendarView): void {
    this.view = view;
  }

  handleEventClick(event: CalendarEvent): void {
    const dialogRef = this.dialog.open(ReminderDetailsDialogComponent, {
      width: '400px',
      data: { event }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit') {
        this.editReminder(event);
      } else if (result?.action === 'delete') {
        this.deleteReminder(event);
      }
    });
  }
  editReminder(event: CalendarEvent): void {
    const reminderFromMeta = event.meta as Reminder;

    if (!reminderFromMeta || reminderFromMeta.id === undefined) {
      console.error("Não foi possível encontrar os dados do lembrete no evento do calendário:", event);
      this.snackBar.open('Erro ao obter detalhes do lembrete.', 'OK', { duration: 3000 });
      return;
    }

    this.jobApplicationService.getJobApplications().subscribe({
      next: (allApplications) => {
        let targetJobApplication: JobApplication | undefined = undefined;

        const targetJobAppId = reminderFromMeta.jobApplication?.id || reminderFromMeta.jobApplicationId;
        console.log("editReminder - targetJobAppId:", targetJobAppId);

        if (targetJobAppId) {
          targetJobApplication = allApplications.find(app => app.id === targetJobAppId);
          if (!targetJobApplication) {
             console.warn(`Candidatura com ID ${targetJobAppId} associada ao lembrete ${reminderFromMeta.id} não encontrada na lista.`);
          }
        } else {
           console.warn(`Lembrete ${reminderFromMeta.id} não tem um ID de candidatura associado.`);
        }

        const dialogRef = this.dialog.open(AddReminderDialogComponent, {
          width: '400px',
          data: {
            reminder: reminderFromMeta,
            jobApplication: targetJobApplication,
            jobApplications: allApplications,
            isEditing: true,
            requireJobSelection: true
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.reminderService.loadReminders();
          }
        });
      },
      error: (error) => {
        console.error('Erro ao carregar lista de candidaturas para edição do lembrete:', error);
        this.snackBar.open('Erro ao carregar candidaturas. Não é possível editar o lembrete agora.', 'OK', { duration: 5000 });
      }
    });
  }

  deleteReminder(event: CalendarEvent): void {
    const reminderId = event.id as number;

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '350px',
    data: { title: 'Confirmação', message: 'Deseja realmente excluir este lembrete?' }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.reminderService.deleteReminder(reminderId).subscribe({
        next: () => {
          this.loadReminders();
          this.snackBar.open('Lembrete excluído com sucesso!', 'OK', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.snackBar.open('Erro ao excluir lembrete', 'OK', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  });
}

}
