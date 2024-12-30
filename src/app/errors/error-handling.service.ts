import { Injectable } from '@angular/core';
import { ErrorMessageService } from './error-message/error-message.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  constructor(
    private errorMessageService: ErrorMessageService,
    private router: Router
  ) {}

  handleError(err: any) {
    console.error('Error has occurred' + err);

    this.errorMessageService.setError(err);
    this.router.navigate(['/error']);
  }
}
