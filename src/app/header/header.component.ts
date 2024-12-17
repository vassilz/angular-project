import { Component } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  constructor(private authenticationService: AuthenticationService) {}

  logout() {
    this.authenticationService.logout();
  }
  isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }
}
