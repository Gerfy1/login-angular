import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarModule } from 'angular-calendar';
import { isSameDay } from 'date-fns';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-dashboard-home',
  imports: [ CommonModule, CalendarModule ],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent implements OnInit {

  refresh: Subject<any> = new Subject();

  ngOnInit() {
    this.activeDayIsOpen = false;
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
  }

  handleEvent(action: string, event: CalendarEvent): void {
    console.log(action, event);
  }
}

function isSameMonth(date: Date, viewDate: Date): boolean {
  return date.getMonth() === viewDate.getMonth() && date.getFullYear() === viewDate.getFullYear();
}

