import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { JobApplication } from "../models/job-application.model";
import { EventService } from "./event.service";

@Injectable({
  providedIn: 'root'
})

export class JobApplicationService {

  private apiUrl = 'http://localhost:81/api/job-applications';


  constructor(private http: HttpClient, private eventService: EventService){}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('auth-token');
    console.log('Raw token from session:', token);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log('Using token for Authorization:', token);
    console.log('Headers created:', headers);
    return headers;
  }

  getJobApplications(): Observable<JobApplication[]> {
    console.log('Fetching job applications from:', this.apiUrl);
    const headers = this.getAuthHeaders();
    console.log('Headers:', headers);
    return this.http.get<JobApplication[]>(this.apiUrl, { headers });
  }

  getJobApplicationById(id: number): Observable<JobApplication> {
    const headers = this.getAuthHeaders();
    return this.http.get<JobApplication>(`${this.apiUrl}/${id}`, { headers });
  }

  addJobApplication(jobApplication: JobApplication): Observable<JobApplication> {
    const userId = sessionStorage.getItem('user-id');
    jobApplication.user = { id: Number(userId) };
    const headers = this.getAuthHeaders();
    console.log('Adding job application:', jobApplication);
    console.log('Headers:', headers);
    return this.http.post<JobApplication>(this.apiUrl, jobApplication, { headers })
    .pipe(
      tap(newJobApplication => {
        this.eventService.notifyJobApplicationAdded(newJobApplication);
      })
    );
  }

  updateJobApplicationStatus(id: number, status: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, { status }, { headers });
  }

  deleteJobApplication(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
