import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarModule } from 'angular-calendar';
import { isSameDay, set } from 'date-fns';
import { AfterViewInit, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { StatisticsComponent } from '../../components/statistics/statistics.component';
import { NotificationService } from '../../services/notification.service';
import { NotificationListComponent } from '../../components/notification-list/notification-list.component';
import { RouterModule } from '@angular/router';
import { ChartConfiguration, ChartData } from 'chart.js';
import { JobApplicationService } from '../../services/job-application.service';
import { MatDialog } from '@angular/material/dialog';
import { ReminderService } from '../../services/reminder.service';
import { AddReminderDialogComponent } from '../../components/add-reminder-dialog/add-reminder-dialog.component';
import { Chart, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { LoginService } from '../../services/login.service';


Chart.register(...registerables);


@Component({
  selector: 'app-dashboard-home',
  imports: [CommonModule, CalendarModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent implements OnInit, AfterViewInit {

  @ViewChild('statusChart') statusChart?: BaseChartDirective;
  @ViewChild('monthlyChart') monthlyChart?: BaseChartDirective;

  username: string = '';

  totalApplications: number = 0;
  applicationTrend: number = 0;
  activeApplications: number = 0;
  responseRate: number = 0;
  interviewCount: number = 0;
  interviewRate: number = 0;
  offerCount: number = 0;
  offerRate: number = 0;

  latestApplications: any[] = [];
  upcomingReminders: any[] = [];

  viewDate: Date = new Date();
  events: any[] = [];
  refresh = new Subject<void>();
  activeDayIsOpen: boolean = false;

  statusChartData: ChartData<'pie'> = {
    labels: ['Pendente', 'Entrevistas', 'Aprovadas', 'Rejeitadas'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#dc3545']
    }]
  };

  statusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  monthlyChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Aug', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [{
      label: 'Candidaturas',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(23, 162, 184, 0.7)'
    }]
  };

  monthlyChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  updateStatusChart(applications: any[]): void {
    const pendingCount = applications.filter(app => app.status === 'Pendente').length;
    const interviewCount = applications.filter(app => app.status === 'Em andamento').length;
    const approvedCount = applications.filter(app => app.status === 'Aceito').length;
    const rejectedCount = applications.filter(app => app.status === 'Rejeitado').length;

    this.statusChartData.datasets[0].data = [
      pendingCount, interviewCount, approvedCount, rejectedCount
    ];

    if (this.statusChartOptions && this.statusChartOptions.animation) {
      this.statusChartOptions.animation = false;
    }
    if (this.statusChart?.chart) {
      this.statusChart.chart.update();
    }

    setTimeout(() => {
      if (this.statusChart?.chart) {
        this.statusChart.chart.update();
      }
    }, 100);
  }

  constructor(private notificationService: NotificationService, private jobApplicationService: JobApplicationService, private dialog: MatDialog, private reminderService: ReminderService, private cdr: ChangeDetectorRef, private loginService: LoginService) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    setTimeout(() => {
      this.refreshAllCharts();
    }, 100);

    setTimeout(() => {
      this.refreshAllCharts();
    }, 500);

    setTimeout(() => {
      this.refreshAllCharts();
      this.cdr.detectChanges();
    }, 1500);

  }

  private refreshAllCharts(): void {
    console.log("Atualizando os Gráficos");
    if (this.statusChart?.chart) {
      this.statusChart.chart.update();
      this.statusChart.chart.resize();
    } else {
      console.log("Gráfico de stauts não disponivel");
    }
    if (this.monthlyChart?.chart) {
      this.monthlyChart.chart.update();
      this.monthlyChart.chart?.resize();
    } else {
      console.log("Gráfico mensal não disponível");
    }
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadDashboardData();
  }

  loadUserInfo(): void {
    this.username = this.loginService.getUsername() || 'Usuário';
  }

  loadDashboardData(): void {
    this.jobApplicationService.getJobApplications().subscribe(applications => {
      this.totalApplications = applications.length;
      this.latestApplications = applications
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      this.activeApplications = applications.filter(app =>
        !['Rejeitado', 'Aceito'].includes(app.status)).length;
      this.interviewCount = applications.filter(app =>
        app.status === 'Em andamento' || app.stage?.includes('Em andamento')).length;
      this.offerCount = applications.filter(app => app.status === 'Aceito').length;
      this.responseRate = this.totalApplications ?
        Math.round((this.totalApplications - applications.filter(app => app.status === 'Pendente').length) / this.totalApplications * 100) : 0;
      this.interviewRate = this.totalApplications ?
        Math.round(this.interviewCount / this.totalApplications * 100) : 0;
      this.offerRate = this.totalApplications ?
        Math.round(this.offerCount / this.totalApplications * 100) : 0;
      this.calculateApplicationTrend(applications);
      this.updateStatusChart(applications);
      this.updateMonthlyChart(applications);

    });
    this.reminderService.getReminders().subscribe(reminders => {
      const now = new Date();
      this.upcomingReminders = reminders
        .filter(reminder => new Date(reminder.date) > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);

      this.events = reminders.map(reminder => ({
        id: reminder.id,
        title: reminder.title,
        start: new Date(reminder.date),
        color: {
          primary: '#1976d2',
          secondary: '#e3f2fd'
        },
        meta: reminder
      }));
      this.refresh.next();
      this.cdr.detectChanges();
      setTimeout(() => {
        this.refreshAllCharts();
      }, 200);
    }, error => {
      console.error('Erro ao carregar candidaturas', error);
    });
  }

  calculateApplicationTrend(applications: any[]): void {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthApps = applications.filter(app => {
      const appDate = new Date(app.date);
      return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
    }).length;

    const lastMonthApps = applications.filter(app => {
      const appDate = new Date(app.date);
      return appDate.getMonth() === lastMonth && appDate.getFullYear() === lastMonthYear;
    }).length;

    if (lastMonthApps === 0) {
      this.applicationTrend = currentMonthApps > 0 ? 100 : 0;
    } else {
      this.applicationTrend = Math.round((currentMonthApps - lastMonthApps) / lastMonthApps * 100);
    }
  }

  updateMonthlyChart(applications: any[]): void {
    const monthlyData = Array(12).fill(0);
    applications.forEach(app => {
      const appDate = new Date(app.date);
      if (!isNaN(appDate.getTime())) {
        monthlyData[appDate.getMonth()]++;
      }
    });

    this.monthlyChartData.datasets[0].data = monthlyData;

    if (this.monthlyChartOptions && this.monthlyChartOptions.animation) {
      this.monthlyChartOptions.animation = false;
    }

    if (this.monthlyChart?.chart) {
      this.monthlyChart.chart.update();
    }

    setTimeout(() => {
      if (this.monthlyChart?.chart) {
        this.monthlyChart.chart.update();
      }
    }, 100);
  }

  dayClicked({ date, events }: any): void {
    this.viewDate = date;
    this.activeDayIsOpen = events.length > 0;
  }
  handleEvent(action: string, event: any): void {
    console.log('Event clicked', event);
  }

  addReminder(): void {
    if (this.latestApplications.length === 0) {
      this.notificationService.showWarning('Você precisa ter pelo menos uma candidatura para adicionar um lembrete.');
      return;
    }

    const dialogRef = this.dialog.open(AddReminderDialogComponent, {
      width: '400px',
      data: {
        date: new Date(),
        jobApplications: this.latestApplications,
        requireJobSelection: true,
        isEditing: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDashboardData();
      }
    });
  }


  isSameMonth(date: Date, viewDate: Date): boolean {
    return date.getMonth() === viewDate.getMonth() && date.getFullYear() === viewDate.getFullYear();
  }
}

