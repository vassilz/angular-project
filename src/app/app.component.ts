import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FirebaseUserService } from './users/firebase-user.service';

// Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
// import { environment } from '../environments/environment';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(private bookService: FirebaseUserService) {}

  ngOnInit(): void {
    // Initialize Firebase
    // const app = initializeApp(environment.firebaseConfig);
    // const analytics = getAnalytics(app);

    this.bookService.getBooks().subscribe((data) => console.log(data.val()));

    this.bookService.doStuff();
  }
  title = 'bookstore';
}
