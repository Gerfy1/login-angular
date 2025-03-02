import { Component } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-input.component';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  imports: [
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent
  ],
  providers: [
    LoginService
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

  signupForm!: FormGroup;
  constructor(private router:Router, private loginService: LoginService, private toastService: ToastrService){
    this.signupForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    })
  }

  submit() {
    this.loginService.register(this.signupForm.value.username, this.signupForm.value.password).subscribe({
      next: (response) => {
        if (response.status === 201) {
          if (response.body && (response.body as any).message) {
            this.toastService.success((response.body as any).message);
            this.signupForm.reset();
            this.router.navigate(["/login"]);
          }
        }
      },
      error: (err) => {
        if (err.status === 400) {
          this.toastService.error(err.error.message);
        } else {
          this.toastService.error("Erro ao registrar, tente novamente!");
        }
      }
    });
  }

  navigate(){
    this.router.navigate(["/login"])
  }
}
