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

  constructor(
  ) {}

  startChecking(): void {
   console.log('ReminderCheckerService: Verificação de lembretes no frontend desativada (Agora no backend).');
  }

  checkReminders(reminders: Reminder): void {
    console.log('ReminderCheckerService: Verificando lembretes no frontend desativada (agora no backend).');
  }
}
