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

  getBooks(start: number = 0, count: number = -1): Observable<Book[]> {
    //TODO optimize this
    var result = new Subject<Book[]>();
    const observable = from(get(ref(this.db, 'books')));

    const subscription = observable.subscribe((data) => {
      var books: Book[] = data.val() || [];
      books.forEach((book, index) => {
        book.id = index;
      });
      books = books.filter((book) => !!book);
      books.sort((bookA, bookB) => (bookA.id < bookB.id ? -1 : 1));
      const end =
        count === -1 ? books.length : Math.min(start + count, books.length);

      const foundBooks: Book[] = books.slice(start, end);

      result.next(foundBooks);
      subscription.unsubscribe();
    });

    return result.asObservable();
  }

  getBooksCount(): Observable<number> {
    var result = new Subject<number>();
    const observable = from(get(ref(this.db, 'books')));

    const subscription = observable.subscribe((data) => {
      var books: Book[] = data.val() || [];
      books = books.filter((book) => !!book);

      result.next(books.length);
      subscription.unsubscribe();
    });

    return result.asObservable();
  }

  getRecentBooks(count: number): Observable<Book[]> {
    var recentBooks = new Subject<Book[]>();
    const observable = from(get(ref(this.db, 'books')));

    //TODO: Cleanup subscriptions!
    const subscription = observable.subscribe((data) => {
      var books: Book[] = data.val() || [];
      books.forEach((book, index) => {
        book.id = index;
      });
      books = books.filter((book) => !!book);
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

  searchBooks(
    term: string,
    start: number = 0,
    count: number = -1
  ): Observable<Book[]> {
    var result = new Subject<Book[]>();
    const observable = from(get(ref(this.db, 'books')));

    //TODO: Cleanup subscriptions!
    const subscription = observable.subscribe((data) => {
      var books: Book[] = data.val() || [];
      books.forEach((book, index) => {
        book.id = index;
      });
      const filteredBooks: Book[] = books.filter(
        (book) =>
          !!book &&
          (book.name.toLowerCase().includes(term.toLowerCase()) ||
            book.author.toLowerCase().includes(term.toLowerCase()))
        // book.synopsis?.toLowerCase().includes(term.toLowerCase())
      );
      filteredBooks.sort((bookA, bookB) => (bookA.id < bookB.id ? -1 : 1));
      const end =
        count === -1
          ? filteredBooks.length
          : Math.min(start + count, filteredBooks.length);

      const foundBooks: Book[] = filteredBooks.slice(start, end);

      result.next(foundBooks);

      subscription.unsubscribe();
      // books.forEach((book) => {
      //   if (book.name.toLowerCase().includes(term.toLowerCase())) {
      //     foundBooks.next(book);
      //   }
      // });
    });

    return result.asObservable();
  }

  getSearchBooksCount(term: string): Observable<number> {
    var result = new Subject<number>();
    const observable = from(get(ref(this.db, 'books')));

    const subscription = observable.subscribe((data) => {
      var books: Book[] = data.val() || [];
      const filteredBooks: Book[] = books.filter(
        (book) =>
          !!book &&
          (book.name.toLowerCase().includes(term.toLowerCase()) ||
            book.author.toLowerCase().includes(term.toLowerCase()))
        // book.synopsis?.toLowerCase().includes(term.toLowerCase())
      );

      result.next(filteredBooks.length);
      subscription.unsubscribe();
    });

    return result.asObservable();
  }

  createBook(
    name: string,
    author: string,
    publishDate: string,
    pagesCount: number,
    synopsis?: string
  ): Observable<void> {
    var result = new Subject<void>();
    const observable = from(get(ref(this.db, 'books')));

    const subscription = observable.subscribe((data) => {
      const books: Book[] = data.val() || [];
      const nextBookId = books.length;
      subscription.unsubscribe();

      from(
        set(ref(this.db, 'books/' + nextBookId), {
          name,
          author,
          publishDate,
          pagesCount,
          synopsis,
        })
      ).subscribe(() => {
        result.next();
      });
    });

    return result.asObservable();
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

  deleteBook(bookId: number): Observable<void> {
    return from(remove(ref(this.db, 'books/' + bookId)));
  }
}
