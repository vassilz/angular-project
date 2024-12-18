import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from 'firebase/auth';
import { BehaviorSubject, from, Observable, Subscription, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService implements OnDestroy {
  private user$$ = new BehaviorSubject<User | null>(null);
  private user$ = this.user$$.asObservable();

  user: User | null = null;
  userSubscription: Subscription | null = null;

  constructor(private router: Router) {
    this.userSubscription = this.user$.subscribe((user) => {
      this.user = user;
    });
  }

  register(email: string, password: string): Observable<UserCredential> {
    const auth = getAuth();
    return from(createUserWithEmailAndPassword(auth, email, password)).pipe(
      tap((userCredential) => {
        // Signed up
        const user = userCredential.user;
        console.log('User registered: ' + user);
        this.user$$.next(user);
      })
    );
  }

  login(email: string, password: string): Observable<UserCredential> {
    const auth = getAuth();
    return from(signInWithEmailAndPassword(auth, email, password)).pipe(
      tap((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log('User logged in: ' + user);
        this.user$$.next(user);
      })
    );
  }

  logout(): Observable<void> {
    const auth = getAuth();
    return from(signOut(auth)).pipe(
      tap((userCredential) => {
        // Sign-out successful.
        console.log('User logged out');
        this.user$$.next(null);
      })
    );
  }

  get isLoggedIn(): boolean {
    return !!this.user;
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}
