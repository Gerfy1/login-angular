import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { ReminderService } from '../../services/reminder.service';
import { Reminder } from '../../models/reminder.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

  constructor(private reminderService: ReminderService) {}

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
      this.events = reminders.map(reminder => this.mapReminderToEvent(reminder));
    });
  }

  private mapReminderToEvent(reminder: Reminder): CalendarEvent {
    return {
      id: reminder.id,
      title: reminder.title,
      start: new Date(reminder.date),
      color: reminder.color || {
        primary: '#ad2121',
        secondary: '#FAE3E3'
      },
      meta: {
        description: reminder.description,
        jobApplicationId: reminder.jobApplicationId,
        isCompleted: reminder.isCompleted
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
