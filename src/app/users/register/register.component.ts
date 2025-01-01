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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnDestroy {
  getUserSubscription: Subscription | null = null;
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
    private userService: FirebaseUserService,
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

    this.getUserSubscription = this.userService.getUsers().subscribe((data) => {
      let userCount = data.val()?.length || 0;

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
            userService
              .createUser(
                userCount,
                uuid,
                username!,
                email!,
                firstName,
                lastName,
                password!,
                []
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
    });
  }

  ngOnDestroy(): void {
    this.getUserSubscription?.unsubscribe();
    this.registerSubscription?.unsubscribe();
    // this.createUserSubscription?.unsubscribe();
  }
}
