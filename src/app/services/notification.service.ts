import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, Observable, tap, throwError } from "rxjs";
import { Notification } from "../models/notification.model";
import { ToastrService } from "ngx-toastr";
import { Overlay } from '@angular/cdk/overlay';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment.prod";

@Injectable({
  providedIn: 'root'
})

export class NotificationService {

  private apiUrl = environment.apiUrl + '/api/notifications';

  private notifications: Notification[] = [];
  private notificationSubject = new BehaviorSubject<Notification[]>([]);
  private notificationsVisible = new BehaviorSubject<boolean>(false);
  public notificationsVisible$ = this.notificationsVisible.asObservable();

  private tokenKey = 'auth-token';
  private userIdKey = 'user-id';

  constructor(private toastr: ToastrService, private overlay: Overlay, private http: HttpClient) {
    if (this.isAuthenticated()) {
      this.loadNotifications();
    }
  }

  private getAuthHeaders(): HttpHeaders{
    const token = sessionStorage.getItem('auth-token') || localStorage.getItem('auth-token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private notifySubscribers(): void {
    this.notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.notificationSubject.next(this.notifications);
  }

  private getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey) || localStorage.getItem(this.tokenKey);
  }

  private isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private getUserId(): number | null {
    const id = sessionStorage.getItem(this.userIdKey) || localStorage.getItem(this.userIdKey);
    return id ? parseInt(id, 10) : null;
  }



toggleNotifications(): void {
  this.notificationsVisible.next(!this.notificationsVisible.value);
  if (this.notificationsVisible.value && this.notifications.length === 0) {
    this.loadNotifications();
  }
}

loadNotifications(): void {
  this.http.get<Notification[]>(this.apiUrl, { headers: this.getAuthHeaders() })
  .pipe(
    tap(notifications => {
      this.notifications = notifications.map( n => ({
        ...n,
        createdAt: new Date(n.createdAt)
      }));
      this.notifySubscribers();
    }),
    catchError(error => {
      console.error('Erro ao carregar notificações', error);
      this.showError('Não foi possível carregar as notificações');
      return throwError(() => error);
    })
  ).subscribe();
}

  hideNotifications(): void {
    this.notificationsVisible.next(false);
  }

  getNotification(): Notification[] {
    return this.notifications;
  }

  getNotificationsObservable(): Observable<Notification[]> {
    return this.notificationSubject.asObservable();
  }

  markAsRead(id: number): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      this.http.put<Notification>(`${this.apiUrl}/${id}/read`, {}, { headers: this.getAuthHeaders()})
      .pipe(
        tap(updateNotification => {
          notification.read = true;
          this.notifySubscribers();
        }),
        catchError(error => {
          console.error(`Erro ao marcar notificação ${id} como lida.`);
          this.toastr.error('Erro ao marcar notificação como lida');
          return throwError(() => error);
        })
      ).subscribe();
    }
  }

  markAllAsRead(): void {
    const hasUnread = this.notifications.some(n => !n.read);
    if (hasUnread) {
      this.http.put(`${this.apiUrl}/read-all`, {}, {headers: this.getAuthHeaders()})
      .pipe(
        tap(() => {
          this.notifications.forEach(n => n.read = true);
          this.notifySubscribers();
        }),
        catchError(error => {
          console.error('Erro ao marcar todas as notificações como lidas', error);
          this.toastr.error('Erro ao marcar todas as notificações como lidas');
          return throwError(() => error);
        })
      ).subscribe();
    }
  }

  clearNotifications(): void {
    this.http.delete<void>(`${this.apiUrl}/all`, { headers: this.getAuthHeaders() })
      .pipe(
        tap(() => {
          this.notifications = [];
          this.notifySubscribers();
          this.showSuccess('Todas as notificações foram limpas.');
        }),
        catchError(error => {
          console.error('Erro ao limpar todas as notificações', error);
          this.showError('Não foi possível limpar todas as notificações.');
          return throwError(() => error);
        })
      ).subscribe();
  }

  removeNotification(id: number): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders()})
    .pipe(
      tap(() =>{
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.notifySubscribers();
      }),
      catchError(error => {
        console.error(`Erro ao remover notificação ${id}`, error);
        this.toastr.error('Erro ao remover notificação');
        return throwError(() => error);
      })
    ).subscribe();
  }

  clearLocalNotifications(): void {
    this.notifications = [];
    this.notifySubscribers();
  }

  showWarning(message: string, title: string = 'Aviso'): void { this.toastr.warning(message, title); }
  showSuccess(message: string, title: string = 'Sucesso'): void { this.toastr.success(message, title); }
  showError(message: string, title: string = 'Erro'): void { this.toastr.error(message, title); }
  showInfo(message: string, title: string = 'Informação'): void { this.toastr.info(message, title); }
}
