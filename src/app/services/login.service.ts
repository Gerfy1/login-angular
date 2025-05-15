import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { LoginResponse } from '../types/login-response.type';
import { tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';
import { ReminderService } from './reminder.service';


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
  private tokenKey = 'auth-token';
  private userIdKey = 'user-id';
  private usernameKey = 'username';

  constructor(private httpClient: HttpClient, private router: Router, private injector: Injector) { }

  private get notificationService(): NotificationService{
    return this.injector.get(NotificationService);
  }

  private get reminderService(): ReminderService{
    return this.injector.get(ReminderService);
  }


  login(credentials: any): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token && response.userId && response.username) {
          this.saveToken(response.token);
          this.saveUserId(response.userId.toString());
          this.saveUsername(response.username);
        } else {
          console.error('Resposta de login inválida:', response);
        }
      }),
      catchError(error => {
        console.error('Erro no login:', error);
        return throwError(() => error);
      })
    );
  }

  private saveToken(token: string): void {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
      sessionStorage.setItem(this.tokenKey, token);
      console.log('Token salvo com sucesso');
    }
  }
  private saveUserId(userId: number): void {
    localStorage.setItem(this.userIdKey, userId.toString());
    sessionStorage.setItem(this.userIdKey, userId.toString());
    console.log('UserId salvo com sucesso:', userId);
  }

  private saveUsername(username: string): void {
    localStorage.setItem(this.usernameKey, username);
    sessionStorage.setItem(this.usernameKey, username);
    console.log('Username salvo com sucesso:', username);
  }


  getUserId(): number | null {
    const id = localStorage.getItem(this.userIdKey);
    return id ? parseInt(id, 10) : null;
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }


  getUserData(): { userId: number | null, username: string | null, token: string | null } {
    return {
      userId: this.getUserId(),
      username: this.getUsername(),
      token: this.getToken()
    };
  }

  logout(): void {
    const userId = this.getUserId();
    this.notificationService.clearLocalNotifications();
    this.reminderService.clearRemindersOnLogout();
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.usernameKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userIdKey);
    sessionStorage.removeItem(this.usernameKey);
    if (userId) {
      localStorage.removeItem(`notifications_${userId}`);
    }
    this.router.navigate(['/login']);
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

  testEndpoint(): Observable<any> {
    return this.httpClient.get('/api/auth/test-auth', { responseType: 'text' });
  }
}
