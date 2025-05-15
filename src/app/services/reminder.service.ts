import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject, catchError } from "rxjs";
import { tap } from "rxjs";
import { Reminder } from "../models/reminder.model";
import { environment } from "../../environments/environment.prod";
import { ReminderCreate } from "../models/reminder-create.model";
import { NotificationService } from "./notification.service";

@Injectable({
  providedIn: 'root'
})

export class ReminderService {

  private apiUrl = environment.apiUrl + '/api/reminders';
  private remindersSubject = new BehaviorSubject<Reminder[]>([]);

  public reminders$ = this.remindersSubject.asObservable();

  constructor (private http: HttpClient, private notificationService: NotificationService) {
  }

  private getAuthHeaders(): HttpHeaders {
     const token = sessionStorage.getItem('auth-token') || localStorage.getItem('auth-token');
     if (!token) {
         console.warn('Token não encontrado para adicionar headers de autenticação.');
         return new HttpHeaders({ 'Content-Type': 'application/json' });
     }
     return new HttpHeaders({
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
     });
   }


  loadReminders(): void {
    const headers = this.getAuthHeaders();
    this.http.get<Reminder[]>(this.apiUrl, { headers })
    .pipe(
        tap(reminders => {
        const colorizedReminders = reminders.map(reminder => ({
            ...reminder,
            date: new Date(reminder.date),
            color: {
            primary: '#1e90ff',
            secondary: '#D1E8FF'
            }
        }));
        this.remindersSubject.next(colorizedReminders);
        }),
    ).subscribe();
  }

  getReminders(): Observable<Reminder[]> {
    return this.reminders$;
  }

  getReminder(id: number): Observable<Reminder> {
    const headers = this.getAuthHeaders();
    return this.http.get<Reminder>(`${this.apiUrl}/${id}`, { headers });
  }

  clearRemindersOnLogout(): void {
    this.remindersSubject.next([]);
  }

  addReminder(reminder: ReminderCreate): Observable<Reminder> {
    const headers = this.getAuthHeaders();
    return this.http.post<Reminder>(this.apiUrl, reminder, { headers })
    .pipe(
      tap(newReminder => {
        this.notificationService.showSuccess(`Lembrete "${newReminder.title}" criado com sucesso!`);
        this.loadReminders();
      })
    );
  }

  updateReminder(id: number, reminder: ReminderCreate): Observable<Reminder> {
    const headers = this.getAuthHeaders();
    return this.http.put<Reminder>(`${this.apiUrl}/${id}`, reminder, { headers }).pipe(
      tap(updatedReminder => {
        this.notificationService.showSuccess(`Lembrete "${updatedReminder.title}" atualizado!`);
        this.loadReminders();
      })

    );
  }

  deleteReminder(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe (
      tap(() => {
        this.notificationService.showInfo(`Lembrete removido.`);

        this.loadReminders();
      })
    );
  }


  getReminderById(id: number): Observable<Reminder> {
    return this.http.get<Reminder>(`${this.apiUrl}/${id}`);
  }
}
