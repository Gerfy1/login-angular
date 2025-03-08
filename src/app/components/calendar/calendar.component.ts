import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { isSameDay } from 'date-fns';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReminderDetailsDialogComponent } from '../reminder-details-dialog/reminder-details-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { trigger, style, transition, animate } from '@angular/animations'; // Adicione esta linha

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
  private destroy$ = new Subject<void>();

  constructor(private reminderService: ReminderService, private dialog: MatDialog, private jobApplicationService: JobApplicationService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadReminders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
        data: { jobApplication: applications[0] }
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result){
          this.loadReminders();
        }
      });

    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
  if (
    this.clickedDate &&
    isSameDay(date, this.clickedDate) &&
    this.activeDayIsOpen === true
  ) {
    this.activeDayIsOpen = false;
    return;
  }

  this.clickedDate = date;

  if (events.length > 0) {
    this.activeDayIsOpen = true;
  } else {
    this.openAddReminderDialogForDate(date);
  }
}

openAddReminderDialogForDate(date: Date): void {
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
        jobApplication: applications[0],
        date: date
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadReminders();
      }
    });
  });
}

  private mapReminderToEvent(reminder: Reminder): CalendarEvent {
    let eventDate: Date;
    if (Array.isArray(reminder.date)){
      const [year, month, day, hour, minute] = reminder.date;
      eventDate = new Date(year, month - 1, day, hour, minute);
      console.log(`Reminder ${reminder.id}: Data como Array convertida para ${eventDate}`);
    } else {
      eventDate = new Date(reminder.date);
      console.log(`Reminder ${reminder.id}: Data como Date convertida para ${eventDate}`);
    }
    return {
      id: reminder.id,
      title: reminder.title,
      start: eventDate,
      allDay: false,
      color: {
        primary: '#1976d2',
        secondary: '#e3f2fd'
      },
      meta: {
        description: reminder.description,
        jobApplicationId: reminder.jobApplicationId,
        isCompleted: reminder.completed
      }
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
    const reminderId = event.id as number;

    this.reminderService.getReminderById(reminderId).subscribe(reminder => {
      this.jobApplicationService.getJobApplication(reminder.jobApplicationId).subscribe(jobApplication => {
        const dialogRef = this.dialog.open(AddReminderDialogComponent, {
          width: '400px',
          data: {
            jobApplication,
            reminder,
            isEditing: true
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.loadReminders();
          }
        });
      });
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
