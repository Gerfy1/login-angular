import { Component, HostListener } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

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
  constructor(private router:Router, private loginService: LoginService, private toastService: ToastrService){
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    })
  }

  submit() {
    this.loginService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe({
      next: () => {
        this.toastService.success("Login feito com sucesso!");
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err.status === 400) {
          this.toastService.error("Usuário ou senha inválidos");
        } else {
          this.toastService.error("Erro ao logar, tente novamente!");
        }
      }
    });
  }

  navigate(){
    this.router.navigate(["/register"])
  }
}
