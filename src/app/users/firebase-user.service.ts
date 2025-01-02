import { Injectable } from '@angular/core';
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
import { from, Observable, Subject } from 'rxjs';
import { User } from '../types/user';
import { User as AuthenticatedUser } from '@firebase/auth';
import { Book } from '../types/book';
import { FirebaseBookService } from '../books/firebase-book.service';
import { Settings } from '../types/settings';

@Injectable({
  providedIn: 'root',
})
export class FirebaseUserService {
  constructor(private db: Database, private bookService: FirebaseBookService) {}

  createUser(
    userId: number,
    uuid: string,
    username: string,
    email: string,
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    password: string,
    favoriteBookIds: number[] = [],
    settings: Settings = { pageSize: 5 }
  ): Observable<void> {
    return from(
      set(ref(this.db, `users/${userId}`), {
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

  getUsers(): Observable<DataSnapshot> {
    return from(get(ref(this.db, 'users')));
  }

  getUserById(userId: string): Observable<User> {
    const observable = from(get(ref(this.db, 'users')));

    var foundUser = new Subject<User>();
    observable.subscribe((data) => {
      const users: User[] = data.val();

      users.forEach((user, index) => {
        user.id = index;
      });
      const user = users.filter((user) => user.uuid === userId)[0];

      foundUser.next(user);
    });

    return foundUser.asObservable();
  }

  getFavoriteBookIdsForUser(userId: string): Observable<number[]> {
    var favoriteBookIds = new Subject<number[]>();
    this.getUserById(userId).subscribe((user) => {
      const bookIds: number[] = user.favoriteBookIds || [];
      favoriteBookIds.next(bookIds);
    });

    return favoriteBookIds.asObservable();
  }

  getFavoriteBooksForUser(userId: string): Observable<Book> {
    var favoriteBooks = new Subject<Book>();
    this.getUserById(userId).subscribe((user) => {
      const bookIds: number[] = user.favoriteBookIds || [];
      bookIds.forEach((id) => {
        this.bookService.getBook(id).subscribe((data) => {
          const book = data.val();
          if (!!book) {
            favoriteBooks.next(book);
          }
        });
      });
    });

    return favoriteBooks.asObservable();
  }

  addFavoriteBookForUser(userId: string, bookId: number): Observable<void> {
    const subject = new Subject<void>();

    this.getUserById(userId).subscribe((user) => {
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
        favoriteBookIds
      ).subscribe((data) => {
        console.info('User updated successfully');
        // this.router.navigate(['/home']);

        subject.next();
      });
    });

    return subject.asObservable();
  }

  removeFavoriteBookForUser(userId: string, bookId: number): Observable<void> {
    const subject = new Subject<void>();

    this.getUserById(userId).subscribe((user) => {
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
        favoriteBookIds
      ).subscribe((data) => {
        // this.router.navigate(['/home']);

        subject.next();
      });
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

  doStuff() {
    const doc = ref(this.db, 'user');
    console.log(doc);
    objectVal(doc).subscribe((data: any) => console.log(data));
  }
}
