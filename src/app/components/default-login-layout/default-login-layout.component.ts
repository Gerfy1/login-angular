import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-default-login-layout',
  imports: [],
  templateUrl: './default-login-layout.component.html',
  styleUrl: './default-login-layout.component.scss'
})
export class DefaultLoginLayoutComponent {
  @Input() title: string = "";
  @Input() primaryBtnText: string = "";
  @Input() secondaryBtnText: string = "";
  @Input() disablePrimarybtn: boolean = true;
  @Output("submite") onSubmit = new EventEmitter(); 
  @Output("navigate") onNavigate = new EventEmitter(); 


  submit(){
    this.onSubmit.emit();
  }

navigate(){
    this.onSubmit.emit();
  }
}
