import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root' })

export class NotificationService {
  private notifications: string [] = [];

  constructor (){}

  addNotification(notification: string): void {
    this.notifications.push(notification);
  }

  getNotifications(): string[] {
    return this.notifications;
  }

  clearNotifications(): void{
    this.notifications = [];
  }

}
