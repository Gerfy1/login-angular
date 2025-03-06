import { Inject, Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { JobApplication } from "../models/job-application.model";

@Injectable({ providedIn: 'root' })

export class EventService {
  private jobApplicationAddedSource = new Subject<JobApplication>();

  jobApplicationAdded$ = this.jobApplicationAddedSource.asObservable();

  notifyJobApplicationAdded(jobApplication: JobApplication): void {
    this.jobApplicationAddedSource.next(jobApplication);
  }

}
