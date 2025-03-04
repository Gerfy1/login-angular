import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-list',
  imports: [CommonModule],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss'
})
export class NotificationListComponent implements OnInit {
  notifications: string[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notifications = this.notificationService.getNotifications();
  }

  clearNotifications(): void {
    this.notificationService.clearNotifications();
    this.notifications = [];
  }

}
