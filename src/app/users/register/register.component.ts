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
import { ErrorMessageService } from '../../error-message/error-message.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-register',
  standalone: true,
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
    private authenticationService: AuthenticationService,
    private router: Router,
    private errorMessageService: ErrorMessageService
  ) {}

  get passGroup() {
    return this.form.get('passGroup');
  }

  register() {
    if (this.form.invalid) {
      return;
    }

    this.userService.getUsers().subscribe((data) => {
      let userCount = data.val()?.length || 0;

      console.log(this.form.value);

      const {
        username,
        email,
        firstName,
        lastName,
        passGroup: { password, repeatPassword } = {},
      } = this.form.value;

      const router = this.router;
      const errorMessageService = this.errorMessageService;
      const userService = this.userService;

      this.authenticationService.register(email!, password!).subscribe({
        next(userCredential) {
          const user: User = userCredential.user;
          const uuid = user.uid;
          userService
            .createUser(
              userCount,
              uuid,
              username!,
              email!,
              firstName,
              lastName,
              password!
            )
            .subscribe((data) => {
              console.log(data);
            });

          router.navigate(['/books']);
        },
        // TODO handle errors with an interceptor
        error(err) {
          console.log('Registration error' + err);

          errorMessageService.setError(err);
          router.navigate(['/error']);
        },
        // complete() {
        //   console.log('Subscription complete');
        // },
      });
    });
  }
}
