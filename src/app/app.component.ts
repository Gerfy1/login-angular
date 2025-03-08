import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './services/loading.service';
import {NgxSpinnerService} from 'ngx-spinner';
import { NgxSpinner } from 'ngx-spinner';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(
    private spinner: NgxSpinnerService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.loadingService.loading$.subscribe((loading) => {
      if (loading) {
        this.spinner.show();
      } else {
        this.spinner.hide();
      }
    });
  }

  title = 'login-angular';
}
