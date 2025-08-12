import { Component, signal } from '@angular/core';
import { ErrorMessageService } from './error-message.service';
import { Location } from '@angular/common';
import { Error } from '../error-handling.service';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css',
})
export class ErrorMessageComponent {
  errorMessage = signal('');

  constructor(
    private errorMessageService: ErrorMessageService,
    private location: Location
  ) {
    this.errorMessageService.apiError$.subscribe((err: Error | null) => {
      if (err) {
        this.errorMessage.set(err.message);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
