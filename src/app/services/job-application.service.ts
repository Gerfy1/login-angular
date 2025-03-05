import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { JobApplication } from "../types/job-application.type";

@Injectable({
  providedIn: 'root'
})

export class JobApplicationService {

  private apiUrl = 'http://localhost:8081/job-applications';

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
