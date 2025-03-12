import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { tap } from "rxjs";
import { Reminder } from "../models/reminder.model";
import { environment } from "../../environments/environment";
import { ReminderCreate } from "../models/reminder-create.model";
import { NotificationService } from "./notification.service";

@Injectable({
  providedIn: 'root'
})

export class ReminderService {

  private apiUrl = '/api/reminders';
  private remindersSubject = new BehaviorSubject<Reminder[]>([]);
  private reminders: Reminder[] = [];

  public reminders$ = this.remindersSubject.asObservable();

  constructor (private http: HttpClient, private notificationService: NotificationService) {
    this.loadReminders();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth-token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }


  loadReminders(): void {
    const headers = this.getAuthHeaders();
    this.http.get<Reminder[]>(this.apiUrl, { headers })
    .subscribe(reminders => {
      const colorizedReminders = reminders.map(reminder => ({
        ...reminder,
        color: {
          primary: '#ad2121',
          secondary: '#FAE3E3'
        }
      }));
      this.remindersSubject.next(colorizedReminders);
    });
  }

  getReminders(): Observable<Reminder[]> {
    return this.reminders$;
  }

  getReminder(id: number): Observable<Reminder> {
    const headers = this.getAuthHeaders();
    return this.http.get<Reminder>(`${this.apiUrl}/${id}`, { headers });
  }

  addReminder(reminder: ReminderCreate): Observable<Reminder> {
    const headers = this.getAuthHeaders();
    return this.http.post<Reminder>(this.apiUrl, reminder, { headers })
    .pipe(
      tap(newReminder => {
        const date = new Date(newReminder.date);
        this.notificationService.addNotification(
          `Novo lembrete criado: "${newReminder.title}" para ${date.toLocaleString()}`,
          'reminder',
          newReminder.id
        );
        this.loadReminders();
        const currentReminders = this.remindersSubject.value;
        const updatedReminders = [...currentReminders, {
          ...newReminder,
          color: {
            primary: '#ad2121',
            secondary: '#FAE3E3'
          }
        }];
        this.remindersSubject.next(updatedReminders);
      })
    );
  }

  updateReminder(id: number, reminder: ReminderCreate): Observable<Reminder> {
    const headers = this.getAuthHeaders();
    return this.http.put<Reminder>(`${this.apiUrl}/${id}`, reminder).pipe(
      tap(updatedReminder => {
        this.notificationService.addNotification(
          `Lembrete atualizado: "${updatedReminder.title}"`,
          'reminder',
          updatedReminder.id
        );
        this.loadReminders();
      })
    );
  }

  // updateReminder(id: number, reminder: Reminder): Observable<Reminder> {
  //   const headers = this.getAuthHeaders();
  //   return this.http.put<Reminder>(`${this.apiUrl}/${id}`, reminder, { headers })
  //     .pipe(
  //       tap(updatedReminder => {
  //         const currentReminders = this.remindersSubject.value;
  //         const index = currentReminders.findIndex(r => r.id === id);
  //         if (index !== -1) {
  //           const updatedReminders = [...currentReminders];
  //           updatedReminders[index] = {
  //             ...updatedReminder,
  //             color: {
  //               primary: '#ad2121',
  //               secondary: '#FAE3E3'
  //             }
  //           };
  //           this.remindersSubject.next(updatedReminders);
  //         }
  //       })
  //     );
  // }

  getReminderById(id: number): Observable<Reminder> {
    return this.http.get<Reminder>(`${this.apiUrl}/${id}`);
  }

  deleteReminder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.notificationService.addNotification(
          `Lembrete removido`,
          'system'
        );
        this.loadReminders();
      })
    );
  }

  // deleteReminder(id: number): Observable<void> {
  //   const headers = this.getAuthHeaders();
  //   return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers })
  //   .pipe(
  //     tap(() => {
  //       const currentReminders = this.remindersSubject.value;
  //       const updatedReminders = currentReminders.filter(r => r.id !== id);
  //       this.remindersSubject.next(updatedReminders);
  //     })
  //   );
  // }

}
