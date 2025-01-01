import { Injectable } from '@angular/core';
import {
  Database,
  DataSnapshot,
  get,
  ref,
  remove,
  set,
  update,
} from '@angular/fire/database';
import { from, Observable, Subject } from 'rxjs';
import { Book } from '../types/book';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseBookService {
  constructor(private db: Database) {}

  getBooks(): Observable<DataSnapshot> {
    return from(get(ref(this.db, 'books')));
  }

  getRecentBooks(count: number): Observable<Book[]> {
    var recentBooks = new Subject<Book[]>();
    const observable = from(get(ref(this.db, 'books')));

    //TODO: Cleanup subscriptions!
    const subscription = observable.subscribe((data) => {
      const books: Book[] = data.val() || [];
      books.forEach((book, index) => {
        book.id = index;
      });
      books.sort((bookA, bookB) =>
        this.compareDates(bookB.publishDate, bookA.publishDate)
      );
      const mostRecentBooks: Book[] = books.slice(0, count);
      recentBooks.next(mostRecentBooks);
      subscription.unsubscribe();
    });

    return recentBooks.asObservable();
  }

  compareDates(dateA: string, dateB: string) {
    return moment(dateA).isBefore(dateB) ? -1 : 1;
  }

  getBook(id: number): Observable<DataSnapshot> {
    return from(get(ref(this.db, `books/${id}`)));
  }

  searchBooks(term: string): Observable<Book[]> {
    var foundBooks = new Subject<Book[]>();
    const observable = from(get(ref(this.db, 'books')));

    //TODO: Cleanup subscriptions!
    const subscription = observable.subscribe((data) => {
      const books: Book[] = data.val() || [];
      books.forEach((book, index) => {
        book.id = index;
      });
      const filteredBooks: Book[] = books.filter(
        (book) =>
          book.name.toLowerCase().includes(term.toLowerCase()) ||
          book.author.toLowerCase().includes(term.toLowerCase())
        // book.synopsis?.toLowerCase().includes(term.toLowerCase())
      );
      foundBooks.next(filteredBooks);

      subscription.unsubscribe();
      // books.forEach((book) => {
      //   if (book.name.toLowerCase().includes(term.toLowerCase())) {
      //     foundBooks.next(book);
      //   }
      // });
    });

    return foundBooks.asObservable();
  }

  createBook(
    bookId: number,
    name: string,
    author: string,
    publishDate: string,
    pagesCount: number,
    synopsis?: string
  ): Observable<void> {
    return from(
      set(ref(this.db, 'books/' + bookId), {
        name,
        author,
        publishDate,
        pagesCount,
        synopsis,
      })
    );
  }

  updateBook(
    bookId: number,
    name: string,
    author: string,
    publishDate: string,
    pagesCount: number,
    synopsis?: string
  ): Observable<void> {
    return from(
      update(ref(this.db, 'books/' + bookId), {
        name,
        author,
        publishDate,
        pagesCount,
        synopsis,
      })
    );
  }

  deleteBook(bookId: string): Observable<void> {
    return from(remove(ref(this.db, 'books/' + bookId)));
  }
}
