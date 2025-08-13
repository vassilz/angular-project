import { Component, signal } from '@angular/core';
import { ErrorMessageService } from './error-message.service';
import { Location } from '@angular/common';
import { Error } from '../error-handling.service';
import { TimeoutError } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css',
})
export class ErrorMessageComponent {
  errorMessage = signal('');
  timeoutMessage = signal('');

  constructor(
    private errorMessageService: ErrorMessageService,
    private location: Location
  ) {
    this.errorMessageService.apiError$.subscribe((err: Error | null) => {
      if (err) {
        if (err instanceof TimeoutError) {
          this.timeoutMessage.set(err.message);
        } else {
          this.errorMessage.set(err.message);
        }
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
