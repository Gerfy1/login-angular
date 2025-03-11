import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse } from '../types/login-response.type';
import { tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

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
  private baseUrl = '/api/auth';

  constructor(private httpClient: HttpClient, private router: Router) { }

  login(username: string, password: string){
    console.log('Tentando login com:', { username, password: '***' });

    return this.httpClient.post<LoginResponse>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap((value) => {
        console.log('Login response completa:', value);
      }),
      catchError((error) => {
        console.error('Detalhes completos do erro:', error);

        if (error.error) {
          if (typeof error.error === 'string') {
            console.error('Erro retornado como string:', error.error);
          } else {
            console.error('Erro retornado como objeto:', error.error);
          }
        }

        return throwError(() => error);
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
        console.error('Login error details:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        if (error.error && error.error.message) {
          console.error('Server error message:', error.error.message);
        }
        return throwError(error);
      })
    );
  }

  testEndpoint() {
    this.httpClient.get('/api/auth/test-auth', { responseType: 'text' })
      .subscribe(
        data => console.log('Sucesso:', data),
        error => console.error('Erro:', error)
      );
  }
}
