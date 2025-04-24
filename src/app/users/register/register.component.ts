import { Component, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { matchPasswordsValidator } from './match-passwords.validator';
import { FirebaseUserService } from '../firebase-user.service';
import { AuthenticationService } from '../../authentication.service';
import { User } from 'firebase/auth';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { Subscription } from 'rxjs';
import { JettyUserService } from '../jetty-user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnDestroy {
  registerSubscription: Subscription | null = null;
  // createUserSubscription: Subscription | null = null;

  form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    passGroup: new FormGroup(
      {
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        repeatPassword: new FormControl('', [Validators.required]),
      },
      {
        validators: [matchPasswordsValidator('password', 'repeatPassword')],
      }
    ),
  });

  constructor(
    // private userService: FirebaseUserService,
    private userService: JettyUserService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private errorHandlingService: ErrorHandlingService
  ) {}

  get passGroup() {
    return this.form.get('passGroup');
  }

  register() {
    if (this.form.invalid) {
      return;
    }

    const {
      username,
      email,
      firstName,
      lastName,
      passGroup: { password, repeatPassword } = {},
    } = this.form.value;

    const router = this.router;
    const errorHandlingService = this.errorHandlingService;
    const userService = this.userService;

    this.registerSubscription = this.authenticationService
      .register(email!, password!)
      .subscribe({
        next(userCredential) {
          const user: User = userCredential.user;
          const uuid = user.uid;
          const defaultUserSettings = {
            pageSize: 5,
          };
          userService
            .createUser(
              uuid,
              username!,
              email!,
              firstName,
              lastName,
              password!,
              [],
              defaultUserSettings
            )
            .subscribe((data) => {
              console.log(data);
            });

          router.navigate(['/books']);
        },
        // TODO handle errors with an interceptor
        error(err) {
          errorHandlingService.handleError(err);
        },
        // complete() {
        //   console.log('Subscription complete');
        // },
      });
  }

  ngOnDestroy(): void {
    this.registerSubscription?.unsubscribe();
    // this.createUserSubscription?.unsubscribe();
  }
}
