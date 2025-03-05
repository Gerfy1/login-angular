import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { JobApplication } from "../models/job-application.model";

@Injectable({
  providedIn: 'root'
})

export class JobApplicationService {

  private apiUrl = 'http://localhost:8081/job-applications';


  constructor(private http: HttpClient){}

  getJobApplications(): Observable<JobApplication[]>{
    return this.http.get<JobApplication[]>(this.apiUrl);
  }

 getJobApplicationById(id: number): Observable<JobApplication> {
    return this.http.get<JobApplication>(`${this.apiUrl}/${id}`);
  }

  addJobApplication(jobApplication: JobApplication): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.apiUrl, jobApplication);
  }

  updateJobApplicationStatus(id: number, status: string): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${this.apiUrl}/${id}/status`, null , {params: {status}});
  }

  deleteJobApplication(id: number): Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
