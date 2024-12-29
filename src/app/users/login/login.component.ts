import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import { ErrorMessageService } from '../../error-message/error-message.service';

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
    private errorMessageService: ErrorMessageService
  ) {}

  login(form: NgForm) {
    if (form.invalid) {
      console.warn('Invalid login form!');
      return;
    }

    const { email, password } = form.value;

    const router = this.router;
    const errorMessageService = this.errorMessageService;

    this.authenticationService.login(email, password).subscribe({
      next(value) {
        router.navigate(['/books']);
      },
      // TODO handle errors with an interceptor
      error(err) {
        console.error('Login error' + err);

        errorMessageService.setError(err);
        router.navigate(['/error']);
      },
      // complete() {
      //   console.log('Subscription complete');
      // },
    });
  }
}
