import { DestroyRef, Injectable } from '@angular/core';
import {
  Database,
  DataSnapshot,
  get,
  objectVal,
  ref,
  remove,
  set,
  update,
} from '@angular/fire/database';
import { forkJoin, from, Observable, Subject } from 'rxjs';
import { User } from '../types/user';
import { User as AuthenticatedUser } from '@firebase/auth';
import { Book } from '../types/book';
import { FirebaseBookService } from '../books/firebase-book.service';
import { Settings } from '../types/settings';
import { JettyBookService } from '../books/jetty-book.service';
import { UserService } from './user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class FirebaseUserService implements UserService {
  constructor(
    private db: Database,
    private bookService: FirebaseBookService,
    private destroyRef: DestroyRef
  ) {}

  createUser(
    uuid: string,
    username: string,
    email: string,
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    password: string,
    favoriteBookIds: number[] = [],
    settings: Settings = { pageSize: 5 }
  ): Observable<void> {
    var result = new Subject<void>();
    const observable = from(get(ref(this.db, 'users')));

    console.log('Creating user with username:', username);

    const subscription = observable.subscribe((data) => {
      const users: User[] = data.val() || [];
      const nextUserId = users.length;
      subscription.unsubscribe();

      from(
        set(ref(this.db, `users/${nextUserId}`), {
          username,
          uuid,
          email,
          firstName,
          lastName,
          password,
          favoriteBookIds,
          settings,
        })
      ).subscribe({
        next: () => {
          result.next();
        },
        error: (err) => {
          console.error('Error creating user:', err);
          result.error(err);
        },
      });
    });

    return result.asObservable();
  }

  getUsers(): Observable<User[]> {
    var result = new Subject<User[]>();
    const observable = from(get(ref(this.db, 'users')));

    const subscription = observable.subscribe((data) => {
      let users: User[] = data.val() || [];

      users = users.filter((user) => !!user);
      users.forEach((user, index) => {
        user.id = index;
      });

      result.next(users);

      subscription.unsubscribe();
    });

    return result.asObservable();
  }

  getUserById(userId: string): Observable<User | null> {
    const observable = from(get(ref(this.db, 'users')));

    var foundUser = new Subject<User | null>();
    observable.subscribe({
      next: (data) => {
        const users: User[] = data.val();

        users.forEach((user, index) => {
          user.id = index;
        });
        const user = users.filter((user) => user.uuid === userId)[0];

        foundUser.next(user);
      },
      error: (err) => {
        console.error('Error loading user by ID:', err);
        foundUser.next(null);
      },
    });

    return foundUser.asObservable();
  }

  getFavoriteBookIdsForUser(userId: string): Observable<number[]> {
    var favoriteBookIds = new Subject<number[]>();
    this.getUserById(userId).subscribe((user) => {
      // TODO : Check if user is null
      const bookIds: number[] = user!.favoriteBookIds || [];
      favoriteBookIds.next(bookIds);
    });

    return favoriteBookIds.asObservable();
  }

  getFavoriteBooksForUser(userId: string): Observable<Book> {
    var favoriteBooks = new Subject<Book>();
    this.getUserById(userId).subscribe((user) => {
      // TODO : Check if user is null
      const bookIds: number[] = user!.favoriteBookIds || [];
      const observables: Observable<Book | null>[] = [];
      bookIds.forEach((id) => {
        const book$ = this.bookService.getBook(id);
        observables.push(book$);
      });
      forkJoin(observables).subscribe({
        next: (books) => {
          books.forEach((book) => {
            if (!!book) {
              favoriteBooks.next(book);
            }
          });
        },
        complete: () => {
          favoriteBooks.complete();
        },
      });
    });

    return favoriteBooks.asObservable();
  }

  addFavoriteBookForUser(userId: string, bookId: number): Observable<void> {
    const subject = new Subject<void>();

    this.getUserById(userId).subscribe((user) => {
      if (!!user) {
        var favoriteBookIds = user.favoriteBookIds || [];
        const index = favoriteBookIds.indexOf(bookId);
        if (index === -1) {
          favoriteBookIds.push(bookId);
        }

        console.log(favoriteBookIds);

        this.updateUser(
          user.id,
          user.username,
          user.uuid,
          user.email,
          user.firstName,
          user.lastName,
          user.password,
          favoriteBookIds,
          user.settings
        ).subscribe((data) => {
          console.info('User updated successfully');
          // this.router.navigate(['/home']);

          subject.next();
          subject.complete();
        });
      }
    });

    return subject.asObservable();
  }

  removeFavoriteBookForUser(userId: string, bookId: number): Observable<void> {
    const subject = new Subject<void>();

    this.getUserById(userId).subscribe((user) => {
      if (!!user) {
        var favoriteBookIds = user.favoriteBookIds || [];
        const index = favoriteBookIds.indexOf(bookId);
        if (index > -1) {
          // only splice array when item is found
          favoriteBookIds.splice(index, 1); // 2nd parameter means remove one item only
        }

        this.updateUser(
          user.id,
          user.username,
          user.uuid,
          user.email,
          user.firstName,
          user.lastName,
          user.password,
          favoriteBookIds,
          user.settings
        ).subscribe((data) => {
          // this.router.navigate(['/home']);

          subject.next();
          subject.complete();
        });
      }
    });

    return subject.asObservable();
  }

  cleanupFavoriteBook(bookId: number): Observable<void> {
    const subject = new Subject<void>();
    this.getUsers().subscribe((users) => {
      const observables: Observable<void>[] = [];
      users.forEach((user) => {
        var favoriteBookIds = user.favoriteBookIds || [];
        const index = favoriteBookIds.indexOf(bookId);
        if (index > -1) {
          // only splice array when item is found
          favoriteBookIds.splice(index, 1); // 2nd parameter means remove one item only

          const userObservable = this.updateUser(
            user.id,
            user.username,
            user.uuid,
            user.email,
            user.firstName,
            user.lastName,
            user.password,
            favoriteBookIds,
            user.settings
          );
          observables.push(userObservable);
        }
      });

      if (observables.length === 0) {
        console.log('No users to update for book cleanup');
        subject.next();
        subject.complete();
      } else {
        forkJoin(observables)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            console.log(
              'All users have been updated to remove the book from favorites'
            );
            subject.next();
            subject.complete();
          });
      }
    });

    return subject.asObservable();
  }

  // getUserForAuthenticatedUser(
  //   authenticatedUser: AuthenticatedUser
  // ): Observable<User> {
  //   var foundUser = new Subject<User>();
  //   this.getUserById(authenticatedUser.uid).subscribe((user) => {
  //     foundUser.next(user);
  //   });

  //   return foundUser.asObservable();
  // }

  updateUser(
    userId: number,
    username: string,
    uuid: string,
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    favoriteBookIds: number[] = [],
    settings: Settings = { pageSize: 5 }
  ): Observable<void> {
    return from(
      update(ref(this.db, 'users/' + userId), {
        username,
        uuid,
        email,
        firstName,
        lastName,
        password,
        favoriteBookIds,
        settings,
      })
    );
  }

  deleteUser(userId: number): Observable<void> {
    return from(remove(ref(this.db, 'users/' + userId)));
  }

  existsUser(username: string): Observable<boolean> {
    const observable = from(get(ref(this.db, 'users')));

    var userExists = new Subject<boolean>();
    const subscription = observable.subscribe((data) => {
      const users: User[] = data.val() || [];
      const exists = users.some((user) => user.username === username);
      userExists.next(exists);
      userExists.complete();
      subscription.unsubscribe();
    });

    return userExists.asObservable();
  }

  existsUserWithEmail(email: string): Observable<boolean> {
    const observable = from(get(ref(this.db, 'users')));

    var userExists = new Subject<boolean>();
    const subscription = observable.subscribe((data) => {
      const users: User[] = data.val() || [];
      const exists = users.some((user) => user.email === email);
      userExists.next(exists);
      userExists.complete();
      subscription.unsubscribe();
    });

    return userExists.asObservable();
  }

  doStuff() {
    const doc = ref(this.db, 'user');
    console.log(doc);
    objectVal(doc).subscribe((data: any) => console.log(data));
  }
}
