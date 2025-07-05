import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private authenticationService: AuthenticationService) {}

  logout() {
    this.authenticationService.logout();
  }
  isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }
}
