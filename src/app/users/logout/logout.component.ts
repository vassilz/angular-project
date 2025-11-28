import { Component } from '@angular/core';
import { AuthenticationService } from '../../authentication.service';
import { ErrorMessageService } from '../../errors/error-message/error-message.service';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-logout',
  imports: [],
  template: '',
  styleUrl: './logout.component.css',
})
export class LogoutComponent {
  constructor(
    private router: Router,
    private errorMessageService: ErrorMessageService,
    private authenticationService: AuthenticationService
  ) {
    this.logout();
  }

  logout() {
    const router = this.router;
    const errorMessageService = this.errorMessageService;

    this.authenticationService
      .logout()
      .pipe(take(1))
      .subscribe({
        next(value) {
          // Logout successful
          router.navigate(['/home']);
        },
        error(err) {
          errorMessageService.setError(err);
          router.navigate(['/error']);
        },
      });
  }
}
