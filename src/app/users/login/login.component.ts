import { Component, DestroyRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { User } from 'firebase/auth';
import { FirebaseUserService } from '../firebase-user.service';
import { JettyUserService } from '../jetty-user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private errorHandlingService: ErrorHandlingService,
    private userService: FirebaseUserService,
    private destroyRef: DestroyRef // private userService: JettyUserService
  ) {}

  onSubmit(form: NgForm, submitter: any) {
    console.log('Form submitted with submitter:', submitter);
    console.log('Form value:', form.value);
    if (submitter === 'login') {
      this.loginWithEmailAndPassword(form);
    } else if (submitter === 'google') {
      this.loginWithGoogle(form);
    }
  }

  loginWithEmailAndPassword(form: NgForm) {
    if (form.invalid) {
      console.warn('Invalid login form!');
      return;
    }

    const { email, password } = form.value;

    const router = this.router;
    const errorHandlingService = this.errorHandlingService;

    this.authenticationService
      .loginWithEmailAndPassword(email, password)
      .pipe(takeUntilDestroyed(this.destroyRef))
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

    this.authenticationService
      .loginWithGoogle()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next(userCredential) {
          const user: User = userCredential.user;
          const uuid = user.uid;
          const username = user.email!;

          const firstName = user.displayName?.split(' ')[0] ?? '';
          const lastName = user.displayName?.split(' ')[1] ?? '';

          const defaultUserSettings = {
            pageSize: 5,
          };

          const userByUsername = userService.existsUser(username);
          const userByEmail = userService.existsUserWithEmail(user.email!);

          forkJoin([userByUsername, userByEmail]).subscribe(
            ([existsByUsername, existsByEmail]) => {
              if (existsByUsername || existsByEmail) {
                console.log('User already exists, navigating to books');
                router.navigate(['/books']);
                return;
              }
            }
          );

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
}
