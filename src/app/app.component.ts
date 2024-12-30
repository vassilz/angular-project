import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { AuthenticationService } from './authentication.service';
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment';

// Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
// import { environment } from '../environments/environment';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    // Initialize Firebase
    // const app = initializeApp(environment.firebaseConfig);
    // const analytics = getAnalytics(app);

    initializeApp(environment.firebase);

    this.authenticationService.registerAuthChangeCallback();
  }
  title = 'bookstore';
}
