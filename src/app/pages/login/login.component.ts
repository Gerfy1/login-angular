import { Component, HostListener } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ReminderService } from '../../services/reminder.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  imports: [
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent,
    HttpClientModule
  ],
  providers: [
    LoginService
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  @HostListener('document:keydown.enter', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const activeElement = document.activeElement;
    const isRelevantElement = activeElement?.tagName === 'INPUT';
    if (isRelevantElement) {
      event.preventDefault();
      this.submit();
    }
  }

  loginForm!: FormGroup;
  constructor(private router:Router, private loginService: LoginService, private toastService: ToastrService, private reminderService: ReminderService, private notificationService: NotificationService){
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    })
  }

  submit() {
    if (this.loginForm.invalid) {
      this.toastService.warning("Por favor, preencha todos os campos.");
      return;
    }

    const credentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.loginService.login(credentials).subscribe({
      next: () => {
        this.toastService.success("Login feito com sucesso!");
        this.reminderService.loadReminders();
        this.notificationService.loadNotifications();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro no login recebido pelo componente:', err);
        if (err.status === 401 || err.status === 400) {
          this.toastService.error("Usuário ou senha inválidos");
        } else {
          this.toastService.error("Erro ao tentar fazer login. Tente novamente mais tarde.");
        }
      }
    });
  }

  navigate(){
    this.router.navigate(["/register"])
  }
}
