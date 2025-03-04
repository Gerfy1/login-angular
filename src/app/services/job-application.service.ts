import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})

export class JobApplicationService {
  private jobApplications: any[] = [];

  constructor(){}

  getJobApplications(filterText: string = ''): any[] {
    if (filterText) {
      return this.jobApplications.filter(application =>
        application.jobName.toLowerCase().includes(filterText.toLowerCase()) ||
        application.company.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    return this.jobApplications;
  }

  addJobApplication(application: any): void {
    this.jobApplications.push(application);
  }



  updateJobApplicationStatus(id: number, status: string): void {
    const application = this.jobApplications.find(app => app.id === id);
    if (application) {
      application.status = status;
  }
}

}
