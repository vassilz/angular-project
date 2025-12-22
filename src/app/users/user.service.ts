import { Observable } from 'rxjs';
import { Settings } from '../types/settings';
// import { DataSnapshot } from 'firebase/database';
import { Book } from '../types/book';
import { User } from '../types/user';
import { NotificationType } from '../header/notifications/notifications';

export interface UserService {
  createUser(
    uuid: string,
    username: string,
    email: string,
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    password: string,
    favoriteBookIds: number[],
    subscribedFor: NotificationType[],
    subscribedForBookIds: number[],
    settings: Settings
  ): Observable<void>;

  getUsers(): Observable<User[]>;

  getUserById(userId: string): Observable<User | null>;

  getUserByUsername(username: string): Observable<User | null>;

  getUserByEmail(email: string): Observable<User | null>;

  getFavoriteBookIdsForUser(userId: string): Observable<number[]>;

  getFavoriteBooksForUser(userId: string): Observable<Book>;

  addFavoriteBookForUser(userId: string, bookId: number): Observable<void>;

  removeFavoriteBookForUser(userId: string, bookId: number): Observable<void>;

  cleanupForBook(bookId: number): Observable<void>;

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
    settings: Settings
  ): Observable<void>;

  deleteUser(userId: number): Observable<void>;
}
