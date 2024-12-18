import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router, RouterLink } from '@angular/router';
import { ErrorMessageService } from '../error-message/error-message.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private errorMessageService: ErrorMessageService
  ) {}

  logout() {
    const router = this.router;
    const errorMessageService = this.errorMessageService;

    this.authenticationService.logout().subscribe({
      next(value) {
        // Logout successful
        router.navigate(['/home']);
      },
      // TODO handle errors with an interceptor
      error(err) {
        console.log('Logout error' + err);

        errorMessageService.setError(err);
        router.navigate(['/error']);
      },
      // complete() {
      //   console.log('Subscription complete');
      // },
    });
  }
  isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }
}
