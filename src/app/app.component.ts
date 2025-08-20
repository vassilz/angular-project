import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { AuthenticationService } from './authentication.service';
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment';
import { FooterComponent } from './footer/footer.component';
import { ToastService } from './toast/toast.service';

import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { NavigationMenuComponent } from './navigation-menu/navigation-menu.component';

// Import the functions you need from the SDKs you need
// import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';
// import { environment } from '../environments/environment';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

@Component({
    selector: 'app-root',
    imports: [
        CommonModule,
        RouterOutlet,
        HeaderComponent,
        FooterComponent,
        NavigationMenuComponent,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    animations: [
        trigger('fade', [
            transition('void => *', [
                style({ opacity: 0 }),
                animate('500ms ease-in-out', style({ opacity: 1 })),
            ]),
            transition('* => void', [
                animate('500ms ease-in-out', style({ opacity: 0 })),
            ]),
        ]),
    ]
})
export class AppComponent implements OnInit {
  constructor(
    private authenticationService: AuthenticationService,
    protected toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Initialize Firebase
    // const app = initializeApp(environment.firebaseConfig);
    // const analytics = getAnalytics(app);

    initializeApp(environment.firebase);

    this.authenticationService.registerAuthChangeCallback();
  }
  title = 'bookstore';

  removeToast(index: number) {
    this.toastService.remove(index);
  }
}
