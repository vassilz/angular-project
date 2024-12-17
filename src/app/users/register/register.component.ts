import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { matchPasswordsValidator } from './match-passwords.validator';
import { FirebaseUserService } from '../firebase-user.service';
import { AuthenticationService } from '../../authentication.service';

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
    private router: Router
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

      // this.userService
      //   .register(userCount, username!, email!, firstName, lastName, password!)
      //   .subscribe(() => {
      //     this.router.navigate(['/home']);
      //   });

      this.authenticationService.register(email!, password!);
      this.router.navigate(['/books']);
    });
  }
}
