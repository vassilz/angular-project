import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router, RouterLink } from '@angular/router';
import { ErrorMessageService } from '../errors/error-message/error-message.service';
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  uuid: string | null = null;

  authSubscription: Subscription | null = null;
  logoutSubscription: Subscription | null = null;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private errorMessageService: ErrorMessageService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authenticationService.user$.subscribe(
      (loggedInUser) => {
        this.uuid = loggedInUser?.uid || null;
      }
    );
  }

  logout() {
    const router = this.router;
    const errorMessageService = this.errorMessageService;

    this.logoutSubscription = this.authenticationService.logout().subscribe({
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

  ngOnDestroy(): void {
    this.authSubscription!.unsubscribe();
    this.logoutSubscription?.unsubscribe();
  }
}
