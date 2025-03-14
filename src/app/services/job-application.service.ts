import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { JobApplication } from "../models/job-application.model";
import { EventService } from "./event.service";
import { LoginService } from "./login.service";

@Injectable({
  providedIn: 'root'
})

export class JobApplicationService {
;
  private apiUrl = 'api/job-applications';


  constructor(private http: HttpClient, private eventService: EventService, private loginService: LoginService){}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('auth-token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return headers;
  }

  getJobApplications(): Observable<JobApplication[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<JobApplication[]>(this.apiUrl, { headers });
  }
  getJobApplication(id: number): Observable<JobApplication> {
    return this.http.get<JobApplication>(`${this.apiUrl}/${id}`);
  }

  getJobApplicationById(id: number): Observable<JobApplication> {
    const headers = this.getAuthHeaders();
    return this.http.get<JobApplication>(`${this.apiUrl}/${id}`, { headers });
  }

  addJobApplication(jobApplication: JobApplication): Observable<JobApplication> {
    const headers = this.getAuthHeaders();
    const userId = this.loginService.getUserId();
    const username = this.loginService.getUsername();
    jobApplication.user = { id: Number(userId) };
    return this.http.post<JobApplication>(this.apiUrl, jobApplication, { headers })
    .pipe(
      tap(newJobApplication => {
        this.eventService.notifyJobApplicationAdded(newJobApplication);
      })
    );
  }

  updateJobApplicationStatus(id: number, status: string): Observable<JobApplication> {
    const headers = this.getAuthHeaders();
    return this.http.put<JobApplication>(`${this.apiUrl}/${id}/status?status=${status}`, {}, { headers });
  }

  deleteJobApplication(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
