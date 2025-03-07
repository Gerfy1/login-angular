import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { CalendarComponent } from '../../components/calendar/calendar.component';


@Component({
  selector: 'app-calendar-page',
  imports: [CommonModule, SidebarComponent, HeaderComponent, CalendarComponent],
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.scss'
})
export class CalendarPageComponent {

}
