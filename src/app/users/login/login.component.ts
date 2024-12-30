import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';

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
    private errorHandlingService: ErrorHandlingService
  ) {}

  login(form: NgForm) {
    if (form.invalid) {
      console.warn('Invalid login form!');
      return;
    }

    const { email, password } = form.value;

    const router = this.router;
    const errorHandlingService = this.errorHandlingService;

    this.authenticationService.login(email, password).subscribe({
      next(value) {
        router.navigate(['/books']);
      },
      // TODO handle errors with an interceptor
      error(err) {
        errorHandlingService.handleError(err);
      },
    });
  }
}
