import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-default-login-layout',
  templateUrl: './default-login-layout.component.html',
  styleUrls: ['./default-login-layout.component.scss']
})
export class DefaultLoginLayoutComponent {
  @Input() title!: string;
  @Input() primaryBtnText!: string;
  @Input() secondaryBtnText!: string;
  @Input() disablePrimarybtn!: boolean;
  @Output() submit = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<void>();

  onSubmit() {
    this.submit.emit();
  }

  onNavigate() {
    this.navigate.emit();
  }
}

