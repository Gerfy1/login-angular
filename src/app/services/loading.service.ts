import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  private loadingRequests = 0;


  setLoading(loading: boolean) {
    if (loading){
      this.loadingRequests++;
      this.loadingSubject.next(true);
    } else {
      this.loadingRequests--;
      if (this.loadingRequests <= 0) {
        this.loadingRequests = 0;
        this.loadingSubject.next(false);
      }
    }
  }

}
