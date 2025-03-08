import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, CalendarModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit{

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  private destroy$ = new Subject<void>();

  constructor(private reminderService: ReminderService, private dialog: MatDialog, private jobApplicationService: JobApplicationService) {}

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
      });
  }

  openAddReminderDialog(): void {
    this.jobApplicationService.getJobApplications().subscribe(applications => {
      if (applications.length === 0 ){
        alert('Você precisa ter pelo menos uma candidatura registrada para adicionar um lembrete');
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

  dayClicked({date} : {date:Date}):void {
    this.jobApplicationService.getJobApplications().subscribe(applications => {
      if (applications.length === 0){
        alert('Você precisa ter pelo menos uma candidatura registrada para adicionar um lembrete');
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
        primary: '#ad2121',
        secondary: '#FAE3E3'
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
    console.log('clicado', event);
  }


}
