import { Injectable } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';
import { User } from '../types/user';
import { Book } from '../types/book';
import { Settings } from '../types/settings';
import { JettyBookService } from '../books/jetty-book.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class JettyUserService implements UserService {
  constructor(
    private http: HttpClient,
    private bookService: JettyBookService
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
    const observable = this.http.get<User[]>('/api/users');

    const subscription = observable.subscribe((users) => {
      const nextUserId = users.length;
      subscription.unsubscribe();

      this.http
        .post<User>('/api/users', {
          nextUserId,
          username,
          uuid,
          email,
          firstName,
          lastName,
          password,
          favoriteBookIds,
          settings,
        })
        .subscribe(() => {
          result.next();
        });
    });

    return result.asObservable();
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  getUserById(userId: string): Observable<User | null> {
    const observable = this.http.get<User[]>('/api/users');

    var foundUser = new Subject<User>();
    observable.subscribe((users) => {
      //   const users: User[] = users.val();

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
      const bookIds: number[] = user!.favoriteBookIds || [];
      favoriteBookIds.next(bookIds);
    });

    return favoriteBookIds.asObservable();
  }

  getFavoriteBooksForUser(userId: string): Observable<Book> {
    var favoriteBooks = new Subject<Book>();
    this.getUserById(userId).subscribe((user) => {
      const bookIds: number[] = user!.favoriteBookIds || [];
      bookIds.forEach((id) => {
        this.bookService.getBook(id).subscribe((book) => {
          // const book = book.val();
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
          favoriteBookIds
        ).subscribe((data) => {
          console.info('User updated successfully');
          // this.router.navigate(['/home']);

          subject.next();
        });
      } else {
        console.error(`User with id ${userId} not found`);
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
          favoriteBookIds
        ).subscribe((data) => {
          // this.router.navigate(['/home']);

          subject.next();
        });
      } else {
        console.error(`User with id ${userId} not found`);
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
    var result = new Subject<void>();
    this.http
      .put<User>(`/api/users`, {
        userId,
        username,
        uuid,
        email,
        firstName,
        lastName,
        password,
        favoriteBookIds,
        settings,
      })
      .subscribe(() => {
        result.next();
      });
    return result.asObservable();
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`/api/users/${userId}`);
  }
}
