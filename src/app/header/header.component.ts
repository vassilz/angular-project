import { Component, DestroyRef } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router, RouterLink } from '@angular/router';
import { ErrorMessageService } from '../errors/error-message/error-message.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  uuid: string | null = null;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private errorMessageService: ErrorMessageService,
    private destroyRef: DestroyRef
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next(value) {
          // Logout successful
          router.navigate(['/home']);
        },
        // TODO handle errors with an interceptor
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
}
