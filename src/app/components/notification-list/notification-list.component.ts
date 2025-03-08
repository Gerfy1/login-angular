import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { Notification } from '../../models/notification.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-list',
  imports: [CommonModule],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss'
})
export class NotificationListComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription: Subscription = new Subscription();
  constructor(private notificationService: NotificationService, private router: Router) {}

  ngOnInit(): void {
    this.subscription = this.notificationService
      .getNotificationsObservable()
      .subscribe(notifications => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  clearNotifications(): void {
    this.notificationService.clearNotifications();
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  removeNotification(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.removeNotification(id);
  }

  handleNotificationClick(notification: Notification): void {
    this.notificationService.markAsRead(notification.id);

    if (notification.type === 'reminder' && notification.relatedId) {
      this.router.navigate(['/calendar']);
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }
}
