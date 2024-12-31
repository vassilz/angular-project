import { Component, OnInit, signal } from '@angular/core';
import { ErrorMessageService } from './error-message.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css',
})
export class ErrorMessageComponent implements OnInit {
  errorMessage = signal('');

  constructor(
    private errorMessageService: ErrorMessageService,
    private location: Location
  ) {}
  ngOnInit(): void {
    this.errorMessageService.apiError$.subscribe((err: any) => {
      this.errorMessage.set(err?.message);
    });
  }

  goBack() {
    this.location.back();
  }
}
