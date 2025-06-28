import { Component, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { Subscription } from 'rxjs';
import { User } from 'firebase/auth';
import { FirebaseUserService } from '../firebase-user.service';
import { JettyUserService } from '../jetty-user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnDestroy {
  subscription: Subscription | null = null;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private errorHandlingService: ErrorHandlingService,
    private userService: FirebaseUserService
  ) // private userService: JettyUserService
  {}

  loginWithEmailAndPassword(form: NgForm) {
    if (form.invalid) {
      console.warn('Invalid login form!');
      return;
    }

    const { email, password } = form.value;

    const router = this.router;
    const errorHandlingService = this.errorHandlingService;

    this.subscription = this.authenticationService
      .loginWithEmailAndPassword(email, password)
      .subscribe({
        next(userCredential) {
          router.navigate(['/books']);
        },
        // TODO handle errors with an interceptor
        error(err) {
          errorHandlingService.handleError(err);
        },
      });
  }

  loginWithGoogle(form: NgForm) {
    const router = this.router;
    const errorHandlingService = this.errorHandlingService;
    const userService = this.userService;

    this.subscription = this.authenticationService.loginWithGoogle().subscribe({
      next(userCredential) {
        const user: User = userCredential.user;
        const uuid = user.uid;
        const username = user.email!;

        const firstName = user.displayName?.split(' ')[0] ?? '';
        const lastName = user.displayName?.split(' ')[1] ?? '';

        const defaultUserSettings = {
          pageSize: 5,
        };
        userService
          .createUser(
            uuid,
            username,
            user.email!,
            firstName,
            lastName,
            '',
            [],
            defaultUserSettings
          )
          .subscribe((data) => {
            console.log(data);
            router.navigate(['/books']);
          });
      },
      // TODO handle errors with an interceptor
      error(err) {
        errorHandlingService.handleError(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
