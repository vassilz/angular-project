import { Component } from '@angular/core';
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
// import { User } from 'firebase/auth';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { JettyUserService } from '../jetty-user.service';
import { take } from 'rxjs';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
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
    private userService: FirebaseUserService,
    // private userService: JettyUserService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private errorHandlingService: ErrorHandlingService
  ) {}

  get passGroup() {
    return this.form.get('passGroup');
  }

  register() {
    console.log('Registering user with form value:', this.form.value);
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
    const authenticationService = this.authenticationService;

    this.authenticationService
      .register(email!, password!)
      .pipe(take(1))
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
            .subscribe({
              next: (data) => {
                console.log(data);
                router.navigate(['/books']);
              },
              error: (err) => {
                errorHandlingService.handleError(err);
                authenticationService.deleteUser().subscribe({
                  next: () => {
                    console.log('User deleted after failed creation');
                  },
                });
              },
            });
        },
        error(err) {
          errorHandlingService.handleError(err);
        },
        // complete() {
        //   console.log('Subscription complete');
        // },
      });
  }
}
