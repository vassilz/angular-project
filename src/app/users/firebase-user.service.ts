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
import {
  forkJoin,
  from,
  Observable,
  Subject,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';
import { User } from '../types/user';
// import { User as AuthenticatedUser } from '@firebase/auth';
import { Book } from '../types/book';
import { FirebaseBookService } from '../books/firebase-book.service';
import { Settings } from '../types/settings';
import { JettyBookService } from '../books/jetty-book.service';
import { UserService } from './user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationType } from '../header/notifications/notifications';

@Injectable({
  providedIn: 'root',
})
export class FirebaseUserService implements UserService {
  constructor(
    private db: Database,
    private bookService: FirebaseBookService,
    private destroyRef: DestroyRef
  ) {}
  getUserByUsername(username: string): Observable<User | null> {
    const result = new Subject<User | null>();
    from(get(ref(this.db, 'users')))
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          let users: User[] = data.val() || [];
          users = users.filter((user) => !!user);
          users.forEach((user, index) => {
            user.id = index;
          });
          const user = users.find((user) => user.username === username) || null;
          if (user && user.favoriteBookIds === undefined) {
            user.favoriteBookIds = [];
          }
          result.next(user);
          result.complete();
        },
        error: (err) => {
          console.error('Error loading user by username:', err);
          if (err instanceof TimeoutError) {
            result.error(err);
          } else {
            result.next(null);
            result.complete();
          }
        },
      });
    return result.asObservable();
  }

  getUserByEmail(email: string): Observable<User | null> {
    const result = new Subject<User | null>();
    from(get(ref(this.db, 'users')))
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          let users: User[] = data.val() || [];
          users = users.filter((user) => !!user);
          users.forEach((user, index) => {
            user.id = index;
          });
          const user = users.find((user) => user.email === email) || null;
          if (user && user.favoriteBookIds === undefined) {
            user.favoriteBookIds = [];
          }
          result.next(user);
          result.complete();
        },
        error: (err) => {
          console.error('Error loading user by email:', err);
          if (err instanceof TimeoutError) {
            result.error(err);
          } else {
            result.next(null);
            result.complete();
          }
        },
      });
    return result.asObservable();
  }

  createUser(
    uuid: string,
    username: string,
    email: string,
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    password: string,
    favoriteBookIds: number[] = [],
    subscribedFor: NotificationType[] = [],
    subscribedForBookIds: number[] = [],
    settings: Settings = { pageSize: 5 }
  ): Observable<void> {
    var result = new Subject<void>();
    const observable = from(get(ref(this.db, 'users')));

    console.log('Creating user with username:', username);

    const subscription = observable.subscribe((data) => {
      const users: User[] = data.val() || [];
      const nextUserId = users.length;
      subscription.unsubscribe();

      const userByUsername = this.getUserByUsername(username);
      const userByEmail = this.getUserByEmail(email);

      forkJoin([userByUsername, userByEmail]).subscribe({
        next: ([userByUsername, userByEmail]) => {
          if (userByUsername) {
            console.error('User with username already exists:', username);
            result.error(
              new Error(`User with username already exists: ${username}`)
            );
            return;
          }
          if (userByEmail) {
            console.error('User with email already exists:', email);
            result.error(new Error(`User with email already exists: ${email}`));
            return;
          }

          from(
            set(ref(this.db, `users/${nextUserId}`), {
              username,
              uuid,
              email,
              firstName,
              lastName,
              password,
              favoriteBookIds,
              subscribedFor,
              subscribedForBookIds,
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
        if (user.favoriteBookIds === undefined) {
          user.favoriteBookIds = [];
        }
        if (user.subscribedForBookIds === undefined) {
          user.subscribedForBookIds = [];
        }
      });

      result.next(users);

      subscription.unsubscribe();
    });

    return result.asObservable();
  }

  getUserById(userId: string): Observable<User | null> {
    const observable = from(get(ref(this.db, 'users')));

    var foundUser = new Subject<User | null>();
    observable.pipe(timeout(10000)).subscribe({
      next: (data) => {
        const users: User[] = data.val();

        users.forEach((user, index) => {
          user.id = index;
        });
        const user = users.filter((user) => user.uuid === userId)[0];
        if (user && user.favoriteBookIds === undefined) {
          user.favoriteBookIds = [];
        }
        if (user && user.subscribedForBookIds === undefined) {
          user.subscribedForBookIds = [];
        }

        foundUser.next(user);
      },
      error: (err) => {
        console.error('Error loading user by ID:', err);
        if (err instanceof TimeoutError) {
          foundUser.error(err);
        } else {
          foundUser.next(null);
        }
      },
    });

    return foundUser.asObservable();
  }

  getFavoriteBookIdsForUser(userId: string): Observable<number[]> {
    console.log('Getting favorite book IDs for user:', userId);
    var favoriteBookIds = new Subject<number[]>();
    this.getUserById(userId).subscribe((user) => {
      if (!user) {
        favoriteBookIds.error(new Error('User not found for ID: ' + userId));
      } else {
        const bookIds: number[] = user!.favoriteBookIds || [];
        favoriteBookIds.next(bookIds);
      }
    });

    return favoriteBookIds.asObservable();
  }

  getFavoriteBooksForUser(userId: string): Observable<Book> {
    var favoriteBooks = new Subject<Book>();
    this.getUserById(userId).subscribe((user) => {
      if (user == undefined) {
        favoriteBooks.error(new Error('User not found for ID: ' + userId));
      } else {
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
      }
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
          user.subscribedFor,
          user.subscribedForBookIds,
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
          user.subscribedFor,
          user.subscribedForBookIds,
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

  // TODO - add to interface
  getSubscribedBookIdsForUser(userId: string): Observable<number[]> {
    console.log('Getting subscribed book IDs for user:', userId);
    var subscribedBookIds = new Subject<number[]>();
    this.getUserById(userId).subscribe((user) => {
      if (!user) {
        subscribedBookIds.error(new Error('User not found for ID: ' + userId));
      } else {
        const bookIds: number[] = user!.subscribedForBookIds || [];
        subscribedBookIds.next(bookIds);
      }
    });

    return subscribedBookIds.asObservable();
  }

  // TODO - add to interface
  getSubscribedBooksForUser(userId: string): Observable<Book> {
    var subscribedBooks = new Subject<Book>();
    this.getUserById(userId).subscribe((user) => {
      if (user == undefined) {
        subscribedBooks.error(new Error('User not found for ID: ' + userId));
      } else {
        const bookIds: number[] = user!.subscribedForBookIds || [];
        const observables: Observable<Book | null>[] = [];
        bookIds.forEach((id) => {
          const book$ = this.bookService.getBook(id);
          observables.push(book$);
        });
        forkJoin(observables).subscribe({
          next: (books) => {
            books.forEach((book) => {
              if (!!book) {
                subscribedBooks.next(book);
              }
            });
          },
          complete: () => {
            subscribedBooks.complete();
          },
        });
      }
    });

    return subscribedBooks.asObservable();
  }

  cleanupForBook(bookId: number): Observable<void> {
    const subject = new Subject<void>();
    this.getUsers().subscribe((users) => {
      const observables: Observable<void>[] = [];
      users.forEach((user) => {
        var favoriteBookIds = user.favoriteBookIds || [];
        var subscribedBookIds = user.subscribedForBookIds || [];
        const favoriteIndex = favoriteBookIds.indexOf(bookId);
        const subscribedIndex = subscribedBookIds.indexOf(bookId);
        if (favoriteIndex > -1 || subscribedIndex > -1) {
          // only splice array when item is found
          if (favoriteIndex > -1) {
            favoriteBookIds.splice(favoriteIndex, 1); // 2nd parameter means remove one item only
          }
          if (subscribedIndex > -1) {
            subscribedBookIds.splice(subscribedIndex, 1); // 2nd parameter means remove one item only
          }

          const userObservable = this.updateUser(
            user.id,
            user.username,
            user.uuid,
            user.email,
            user.firstName,
            user.lastName,
            user.password,
            favoriteBookIds,
            user.subscribedFor,
            subscribedBookIds,
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
              'All users have been updated to remove the book from favorites or subscriptions'
            );
            subject.next();
            subject.complete();
          });
      }
    });

    return subject.asObservable();
  }

  subscribeForBookForUser(userId: string, bookId: number): Observable<void> {
    const subject = new Subject<void>();

    this.getUserById(userId).subscribe((user) => {
      if (!!user) {
        var subscribedBookIds = user.subscribedForBookIds || [];
        const index = subscribedBookIds.indexOf(bookId);
        if (index === -1) {
          subscribedBookIds.push(bookId);
        }

        console.log(subscribedBookIds);

        this.updateUser(
          user.id,
          user.username,
          user.uuid,
          user.email,
          user.firstName,
          user.lastName,
          user.password,
          user.favoriteBookIds,
          user.subscribedFor,
          subscribedBookIds,
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

  unsubscribeFromBookForUser(userId: string, bookId: number): Observable<void> {
    const subject = new Subject<void>();

    this.getUserById(userId).subscribe((user) => {
      if (!!user) {
        var subscribedBookIds = user.subscribedForBookIds || [];
        const index = subscribedBookIds.indexOf(bookId);
        if (index > -1) {
          // only splice array when item is found
          subscribedBookIds.splice(index, 1); // 2nd parameter means remove one item only
        }

        this.updateUser(
          user.id,
          user.username,
          user.uuid,
          user.email,
          user.firstName,
          user.lastName,
          user.password,
          user.favoriteBookIds,
          user.subscribedFor,
          subscribedBookIds,
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
    favoriteBookIds: number[],
    subscribedFor: NotificationType[],
    subscribedForBookIds: number[],
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
        subscribedFor,
        subscribedForBookIds,
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
