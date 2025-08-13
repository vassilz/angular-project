import { Injectable } from '@angular/core';
import { ErrorMessageService } from './error-message/error-message.service';
import { Router } from '@angular/router';
import { TimeoutError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  constructor(
    private errorMessageService: ErrorMessageService,
    private router: Router
  ) {}

  handleError(err: Error) {
    console.error('Error has occurred' + err);
    console.log(err);

    this.errorMessageService.setError(err);
    this.router.navigate(['/error']);
  }

  handleTimeout(err: TimeoutError) {
    this.errorMessageService.setError(err);
    this.router.navigate(['/error']);
  }
}

export interface Error {
  message: string;
}
