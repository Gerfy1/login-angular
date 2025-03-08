import { Injectable } from '@angular/core';
import { ReminderService } from './reminder.service';
import { NotificationService } from './notification.service';
import { Reminder } from '../models/reminder.model';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReminderCheckerService {
  private checkedReminders = new Set<number>();

  constructor(
    private reminderService: ReminderService,
    private notificationService: NotificationService
  ) {}

  startChecking(): void {
    interval(5 * 60 * 1000).pipe(
      switchMap(() => this.reminderService.getReminders())
    ).subscribe(reminders => {
      this.checkReminders(reminders);
    });

    this.reminderService.getReminders().subscribe(reminders => {
      this.checkReminders(reminders);
    });
  }

  private checkReminders(reminders: Reminder[]): void {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    reminders.forEach(reminder => {
      if (reminder && reminder.id !== undefined) {
        const reminderDate = new Date(reminder.date);

        if (reminderDate > now &&
            reminderDate <= thirtyMinutesFromNow &&
            !this.checkedReminders.has(reminder.id)) {

          this.notificationService.addNotification(
            `Lembrete em breve: "${reminder.title}" às ${reminderDate.toLocaleTimeString()}`,
            'reminder',
            reminder.id
          );

          this.checkedReminders.add(reminder.id);
        }
      }
    });
  }
}
