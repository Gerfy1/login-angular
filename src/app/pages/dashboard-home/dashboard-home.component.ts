import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarModule } from 'angular-calendar';
import { isSameDay } from 'date-fns';
import { Subject } from 'rxjs';
import { StatisticsComponent } from '../../components/statistics/statistics.component';
import { NotificationService } from '../../services/notification.service';
import { NotificationListComponent } from '../../components/notification-list/notification-list.component';

@Component({
  selector: 'app-dashboard-home',
  imports: [ CommonModule, CalendarModule, StatisticsComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent implements OnInit {

  refresh: Subject<any> = new Subject();

  constructor(private notificationService: NotificationService) {}


  ngOnInit() {
    this.activeDayIsOpen = false;
    this.notificationService.addNotification('Welcome to the dashboard!');
  }

  activeDayIsOpen: boolean = false;
  events: CalendarEvent[] = [
    {
      start: new Date(),
      title: 'An event',
    },
    {
      start: new Date(),
      end: new Date(),
      title: 'Another event',
    }
  ];
  viewDate: Date = new Date();

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.refresh.next(null);
    this.notificationService.addNotification('Evento atualizado!');
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(action, event);
    this.notificationService.addNotification(`Evento ${action}!`);
  }
}

function isSameMonth(date: Date, viewDate: Date): boolean {
  return date.getMonth() === viewDate.getMonth() && date.getFullYear() === viewDate.getFullYear();
}

