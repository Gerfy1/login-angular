import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NotificationListComponent } from '../notification-list/notification-list.component';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

declare var bootstrap: any;


@Component({
  selector: 'app-sidebar',
  imports:  [CommonModule ,NotificationListComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements AfterViewInit, OnInit {

  showNotifications: boolean = false;
  constructor ( private notificationService: NotificationService, private router: Router ){}

  ngOnInit(): void {
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
