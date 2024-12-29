import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router, RouterLink } from '@angular/router';
import { ErrorMessageService } from '../error-message/error-message.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  uuid: string | null = null;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private errorMessageService: ErrorMessageService
  ) {}

  ngOnInit(): void {
    this.authenticationService.user$.subscribe((loggedInUser) => {
      this.uuid = loggedInUser?.uid || null;
    });
  }

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
    return this.authenticationService.isLoggedIn;
  }
}
