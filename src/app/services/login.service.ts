import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse } from '../types/login-response.type';
import { tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.prod';

interface TokenWithAccessToken {
  accessToken: string;
}

interface TokenWithToken {
  token: string;
}

interface TokenWithJwt {
  jwt: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {



  private baseUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient, private router: Router) { }

  login(username: string, password: string){
    return this.httpClient.post<LoginResponse>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((value) => {
        console.log('Login response:', value);
        console.log('Token type:', typeof value.token);

        if (typeof value.token === 'object' && value.token !== null) {
          const tokenObj = value.token as any; // Use any para evitar erros de tipo

          if ('accessToken' in tokenObj) {
            sessionStorage.setItem("auth-token", tokenObj.accessToken);
          } else if ('token' in tokenObj) {
            sessionStorage.setItem("auth-token", tokenObj.token);
          } else if ('jwt' in tokenObj) {
            sessionStorage.setItem("auth-token", tokenObj.jwt);
          } else {
            sessionStorage.setItem("auth-token", JSON.stringify(tokenObj));
          }
        } else {
          sessionStorage.setItem("auth-token", value.token as string);
        }

        sessionStorage.setItem("user-id", value.userId.toString());
        sessionStorage.setItem("username", value.username);

        const storedToken = sessionStorage.getItem("auth-token");
        console.log('Stored token:', storedToken);

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
