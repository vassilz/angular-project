import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router, RouterLink } from '@angular/router';
import { ErrorMessageService } from '../errors/error-message/error-message.service';
import { take } from 'rxjs';

@Component({
    selector: 'app-header',
    imports: [RouterLink],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent {
  uuid: string | null = null;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private errorMessageService: ErrorMessageService
  ) {
    this.authenticationService.user$.subscribe((loggedInUser) => {
      this.uuid = loggedInUser?.uid || null;
    });
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
          console.error('Logout error' + err);

          errorMessageService.setError(err);
          router.navigate(['/error']);
        },
        // complete() {
        //   console.log('Subscription complete');
        // },
      });
  }
  isLoggedIn() {
    // console.log('Is logged in: ' + this.authenticationService.isLoggedIn);
    return this.authenticationService.isLoggedIn;
  }

  switchLanguage(language: string) {
    window.location.href = `/${language}/`;
  }
}
