import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Notification } from "../models/notification.model";
import { ToastrService } from "ngx-toastr";
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';


@Injectable({
  providedIn: 'root'
})

export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsVisible = new BehaviorSubject<boolean>(false);
public notificationsVisible$ = this.notificationsVisible.asObservable();
  private notifySubscribers(): void {
    this.notificationSubject.next([...this.notifications]);
  }
  private notificationSubject = new BehaviorSubject<Notification[]>([]);

  constructor(private toastr: ToastrService) {
    this.loadNotificationsFromStorage();
  }


toggleNotifications(): void {
  this.notificationsVisible.next(!this.notificationsVisible.value);
}

hideNotifications(): void {
  this.notificationsVisible.next(false);
}
  showWarning(message: string, title: string = 'Aviso'): void {
    this.toastr.warning(message, title);
  }

  showSuccess(message: string, title: string = 'Sucesso'): void {
    this.toastr.success(message, title);
  }
  showError(message: string, title: string = 'Erro'): void {
    this.toastr.error(message, title);
  }

  showInfo(message: string, title: string = 'Informação'): void {
    this.toastr.info(message, title);
  }

  getNotification(): Notification[] {
    return this.notifications;
  }

  getNotificationsObservable(): Observable<Notification[]> {
    return this.notificationSubject.asObservable();
  }

  addNotification(message: string, type: 'reminder' | 'info' | 'job' | 'system', relatedId?: number): void {
    const notification: Notification = {
      id: Date.now(),
      message,
      type,
      createdAt: new Date(),
      read: false,
      relatedId
    };

    this.notifications.unshift(notification);
    this.saveNotificationsToStorage();
    this.notifySubscribers();
  }

  markAsRead(id: number): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifySubscribers();
      this.saveNotificationsToStorage();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotificationsToStorage();
    this.notifySubscribers();
  }

  clearNotifications(): void {
    this.notifications = [];
    this.saveNotificationsToStorage();
    this.notifySubscribers();
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotificationsToStorage();
    this.notifySubscribers();
  }
  private saveNotificationsToStorage(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  private loadNotificationsFromStorage(): void {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      this.notifications = JSON.parse(savedNotifications);
      this.notifications.forEach(n => {
        n.createdAt = new Date(n.createdAt);
      });
      this.notifySubscribers();
    }
  }
}
