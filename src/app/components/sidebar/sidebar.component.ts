import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NotificationListComponent } from '../notification-list/notification-list.component';
import { NotificationService } from '../../services/notification.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Inject } from '@angular/core';

declare var bootstrap: any;


@Component({
  selector: 'app-sidebar',
  imports:  [CommonModule ,NotificationListComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements AfterViewInit, OnInit {

  showNotifications: boolean = false;
  unreadCount: number = 0;

  constructor ( private notificationService: NotificationService, private router: Router, @Inject(DOCUMENT) private document: Document ){
    this.document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-icon') && this.showNotifications) {
        this.showNotifications = false;
      }
    });
  }

  ngOnInit(): void {
    this.notificationService.getNotificationsObservable().subscribe(notifications => {
      this.unreadCount = notifications.filter(n => !n.read).length;
    });
  }
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;

  }

  ngAfterViewInit() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  logout(){
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

}
