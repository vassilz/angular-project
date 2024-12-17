import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseUserService } from '../firebase-user.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  constructor(
    private userService: FirebaseUserService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  login(form: NgForm) {
    if (form.invalid) {
      console.log('Invalid login form!');
      return;
    }

    const { email, password } = form.value;

    // this.userService.login(email, password).subscribe(() => {
    //   this.router.navigate(['/home']);
    // });

    this.authenticationService.login(email, password);
    this.router.navigate(['/books']);
  }
}
