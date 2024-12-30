import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  onAuthStateChanged,
} from 'firebase/auth';
import { BehaviorSubject, from, Observable, Subscription, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService implements OnDestroy {
  private user$$ = new BehaviorSubject<User | null>(null);
  user$ = this.user$$.asObservable();

  user: User | null = null;
  userSubscription: Subscription | null = null;

  isLoggedIn: boolean = false;

  constructor(private router: Router) {
    this.userSubscription = this.user$.subscribe((user) => {
      this.user = user;
    });
  }

  registerAuthChangeCallback() {
    console.log('Authentication service initialized');
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        // ...
        this.user$$.next(user);
        this.isLoggedIn = true;
        console.log('User session is restored');
      } else {
        // User is signed out
        // ...
        this.user$$.next(null);
        this.isLoggedIn = false;
      }
    });
  }

  register(email: string, password: string): Observable<UserCredential> {
    const auth = getAuth();
    return from(createUserWithEmailAndPassword(auth, email, password)).pipe(
      tap((userCredential) => {
        // Signed up
        const user = userCredential.user;
        console.info('User registered successfully');
        console.debug(user);
        this.user$$.next(user);
        this.isLoggedIn = true;
      })
    );
  }

  login(email: string, password: string): Observable<UserCredential> {
    const auth = getAuth();
    return from(signInWithEmailAndPassword(auth, email, password)).pipe(
      tap((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.info('User logged in');
        console.debug(user);
        this.user$$.next(user);
        this.isLoggedIn = true;
      })
    );
  }

  logout(): Observable<void> {
    const auth = getAuth();
    return from(signOut(auth)).pipe(
      tap((userCredential) => {
        // Sign-out successful.
        console.info('User logged out');
        this.user$$.next(null);
        this.isLoggedIn = false;
      })
    );
  }

  // get isLoggedIn(): boolean {
  //   return !!this.user;
  // }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}
