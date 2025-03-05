import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse } from '../types/login-response.type';
import { tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class LoginService {



  private baseUrl = "http://localhost:81/api/auth"

  constructor(private httpClient: HttpClient, private router: Router) { }

  login(username: string, password: string){
    return this.httpClient.post<LoginResponse>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((value) => {
        sessionStorage.setItem("auth-token", value.token);
        sessionStorage.setItem("user-id", value.userId.toString());
        sessionStorage.setItem("username", value.username);
        this.router.navigate(['/dashboard']);
      }),
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  register(username: string, password: string){
    return this.httpClient.post(`${this.baseUrl}/register`, { username, password }, { observe: 'response' }).pipe(
      tap((response) => {
        if (response.status === 201) {
          console.log('Register response:', response.body);
        }
      }),
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}
