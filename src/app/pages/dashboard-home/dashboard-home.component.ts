import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarModule } from 'angular-calendar';
import { isSameDay, set } from 'date-fns';
import { AfterViewInit, ElementRef, NgZone, ViewChild } from '@angular/core';
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
import { ApplicationStage, ApplicationStatus } from '../../components/job-aplication-list/job-aplication-list.component';
import { ca } from 'date-fns/locale';



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

  ApplicationStatus = ApplicationStatus;
  ApplicationStage = ApplicationStage;

  username: string = '';

  totalApplications: number = 0;
  applicationTrend: number = 0;
  activePipeLineCount: number = 0;
  interviewCount: number = 0;
  interviewRate: number = 0;
  acceptedCount: number = 0;
  sucessRate: number = 0;

  latestApplications: any[] = [];
  upcomingReminders: any[] = [];

  viewDate: Date = new Date();
  events: any[] = [];
  refresh = new Subject<void>();
  activeDayIsOpen: boolean = false;

  stageChartData: ChartData<'pie'> = {
    labels: ['Inscrito', 'Entrevista', 'Teste Técnico', 'Teste Prático', 'Fit/Comportamental', 'Dinâmica', 'Feedback'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: [
        '#6c757d',
        '#0dcaf0',
        '#ffc107',
        '#fd7e14',
        '#20c997',
        '#6f42c1',
        '#198754'
      ],
      borderColor: '#ffffff',
      borderWidth: 1
    }]
  };

  stageChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins:{
      legend: {
        position: 'right',
        display: true,
      }
    }
  };
  stageStatusChartData: ChartData<'bar'> = {
    labels: ['Inscrito', 'Entrevista', 'Teste Técnico', 'Fit/Comportamental', 'Teste Prático', 'Dinâmica', 'Feedback'],
    datasets: [{
      label: 'Pendente',
      backgroundColor: 'rgba(255, 193, 7, 0.6)',
      data: [0, 0, 0, 0, 0, 0, 0]
    },
    {
      label: 'Em andamento',
      backgroundColor: 'rgba(23, 162, 184, 0.6)',
      data: [0, 0, 0, 0, 0, 0, 0]
    },
    {
      label: 'Congelado',
      backgroundColor: 'rgba(108, 117, 125, 0.6)',
      data: [0, 0, 0, 0, 0, 0, 0]
    },
    {
      label: 'Rejeitada',
      backgroundColor: 'rgba(220, 53, 69, 0.6)',
      data: [0, 0, 0, 0, 0, 0, 0]
    }
  ]
  }


  statusChartData: ChartData<'pie'> = {
    labels: ['Pendentes', 'Em Andamento', 'Congelados', 'Rejeitadas'],
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

  updateStageStatusChart(applications: any[]) :void {
    const stages = ['Inscrito', 'Entrevista', 'Teste Técnico', 'Teste Prático', 'Fit/Comportamental', 'Dinâmica', 'Feedback'];
    const statuses = ['Pendente', 'Em andamento', 'Congelado', 'Rejeitado'];

    statuses.forEach((status, statusIndex) => {
      const stageData = stages.map(stage => applications.filter(app => app.stage === stage && app.status === status).length
    );
    this.stageStatusChartData.datasets[statusIndex].data = stageData;
    });

    if (this.statusChart?.chart) {
      this.statusChart.chart.update();
    }
  }

  updateStatusChart(applications: any[]): void {
    const pendingCount = applications.filter(app => app.status === ApplicationStatus.PENDENTE).length;
  const inProgressCount = applications.filter(app => app.status === ApplicationStatus.EM_ANDAMENTO).length;
  const frozenCount = applications.filter(app => app.status === ApplicationStatus.CONGELADO).length;
  const rejectedCount = applications.filter(app => app.status === ApplicationStatus.REJEITADO).length;
  const acceptedCount = applications.filter(app => app.status === ApplicationStatus.ACEITO).length;



   this.statusChartData ={
    labels: ['Pendentes', 'Em Andamento', 'Congelados', 'Rejeitadas', 'Aceitas'],
    datasets: [{
      data: [pendingCount, inProgressCount, frozenCount, rejectedCount, acceptedCount],
      backgroundColor: ['#ffc107', '#17a2b8', '#6c757d', '#dc3545', '#198754'],
   }]
   };
   console.log("StatusCharData atualizado (imutavelmente)")
  }


  updateStageChart(applications: any[]): void {
    const stageValues = ['Inscrito', 'Entrevista', 'Teste Técnico', 'Teste de Fit/Comportamental', 'Teste Prático', 'Dinâmica de Grupo', 'Feedback/Aprovação'];

    const stageCounts = stageValues.map(stage => applications.filter(app => app.stage === stage).length);

    this.stageChartData = {
      labels: this.stageChartData.labels,
      datasets: [{
        ...this.stageChartData.datasets[0],
        data: stageCounts,
      }]
    };
    console.log("StageChartData atualizado (imutavelmente)")
  }

  constructor(private notificationService: NotificationService, private jobApplicationService: JobApplicationService, private dialog: MatDialog, private reminderService: ReminderService, private cdr: ChangeDetectorRef, private loginService: LoginService) { }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    setTimeout(() => {
      this.refreshAllChartsLayout();
    },150)
  }

  private refreshAllChartsLayout(): void {
    console.log("Tentando redimensionar os gráficos após delay");
    if (this.statusChart?.chart){
      this.statusChart.chart.resize();
      console.log("Status chart resized");
    } else {
      console.log("Gráfico de status não disponível para resize")
    }
    if (this.monthlyChart?.chart){
      this.monthlyChart.chart.resize();
      console.log("Monthly chart resized");
    } else {
      console.log("Gráfico mensal não disponível para resize")
    }
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadDashboardData();
    this.reminderService.loadReminders();
    this.notificationService.loadNotifications();
  }

  loadUserInfo(): void {
    this.username = this.loginService.getUsername() || 'Usuário';
  }

  loadDashboardData(): void {
    this.jobApplicationService.getJobApplications().subscribe(applications => {
      this.totalApplications = applications.length;

      this.activePipeLineCount = applications.filter(app => app.status !== ApplicationStatus.REJEITADO && app.status !== ApplicationStatus.ACEITO).length;

      this.interviewCount = applications.filter(app => app.stage === ApplicationStage.ENTREVISTA).length;

      this.acceptedCount = applications.filter(app => app.status === ApplicationStatus.ACEITO).length;

      this.interviewRate = this.totalApplications ? Math.round((this.interviewCount / this.totalApplications) * 100) : 0;
      this.sucessRate = this.totalApplications ? Math.round((this.acceptedCount / this.totalApplications ) * 100): 0;

      this.latestApplications = applications
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      this.interviewCount = applications.filter(app =>
        app.stage === 'Entrevista').length;


      this.interviewRate = this.totalApplications ?
        Math.round(this.interviewCount / this.totalApplications * 100) : 0;


      this.calculateApplicationTrend(applications);
      this.updateStatusChart(applications);
      this.updateStageChart(applications);
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
        start: reminder.date,
        color: reminder.color || {
          primary: '#1976d2',
          secondary: '#e3f2fd'
        },
        meta: reminder
      }));
      this.refresh.next();
      this.cdr.detectChanges();
      console.log("Upcoming reminders atualizado e change detection acionado:", this.upcomingReminders);
    }, error => {
      console.error('Erro ao carregar Lembretes', error);
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
    const currentYear = new Date().getFullYear();
    applications.forEach(app => {
      const appDate = new Date(app.date);
      if (!isNaN(appDate.getTime()) && appDate.getFullYear() === currentYear) {
        monthlyData[appDate.getMonth()]++;
      }
    });

    this.monthlyChartData = {
      labels: this.monthlyChartData.labels,
      datasets: [{
        ...this.monthlyChartData.datasets[0],
        data: monthlyData,
      }]
    };
    console.log("monthlyChartData atualizado (imutavelmente)")
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

  getStatusBadgeClass(status: ApplicationStatus | string): string {
    switch (status) {
      case ApplicationStatus.PENDENTE:
        return 'bg-warning text-dark';
      case ApplicationStatus.EM_ANDAMENTO:
        return 'bg-primary';
      case ApplicationStatus.CONGELADO:
        return 'bg-secondary';
      case ApplicationStatus.REJEITADO:
        return 'bg-danger';
      case ApplicationStatus.ACEITO:
        return 'bg-success';
      default:
        return 'bg-light text-dark';
    }
  }
}
