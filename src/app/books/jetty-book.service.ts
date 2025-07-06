import { Injectable } from '@angular/core';
import { from, Observable, Subject, tap } from 'rxjs';
import { Book } from '../types/book';
import moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { BookService } from './book.service';

@Injectable({
  providedIn: 'root',
})
export class JettyBookService implements BookService {
  constructor(private http: HttpClient) {}

  getBooks(
    start: number = 0,
    count: number = -1,
    sorter: ((a: Book, b: Book) => number) | undefined = undefined
  ): Observable<Book[]> {
    var result = new Subject<Book[]>();
    const observable = this.http.get<Book[]>('/api/books');

    const subscription = observable.subscribe((books) => {
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

  getBooksByAuthor(authorId: number): Observable<Book[]> {
    throw new Error('Method not implemented.');
  }

  getBooksCount(): Observable<number> {
    var result = new Subject<number>();
    const observable = this.http.get<Book[]>('/api/books');

    const subscription = observable.subscribe((books) => {
      // var books: Book[] = books.val() || [];
      books = books.filter((book) => !!book);

      result.next(books.length);
      subscription.unsubscribe();
    });

    return result.asObservable();
  }

  getRecentBooks(count: number): Observable<Book[]> {
    var recentBooks = new Subject<Book[]>();
    const observable = this.http.get<Book[]>('/api/books');

    //TODO: Cleanup subscriptions!
    const subscription = observable.subscribe((books) => {
      // var books: Book[] = books.val() || [];
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

  getBook(id: number): Observable<Book | null> {
    return this.http.get<Book>(`/api/books/${id}`);
  }

  searchBooks(
    term: string,
    start: number = 0,
    count: number = -1,
    sorter: ((a: Book, b: Book) => number) | undefined = undefined
  ): Observable<Book[]> {
    var result = new Subject<Book[]>();
    const observable = this.http.get<Book[]>('/api/books');

    //TODO: Cleanup subscriptions!
    const subscription = observable.subscribe((books) => {
      // var books: Book[] = books.val() || [];
      books.forEach((book, index) => {
        book.id = index;
      });
      const filteredBooks: Book[] = books.filter(
        (book) => !!book && book.name.toLowerCase().includes(term.toLowerCase())
        // book.authorId.toLowerCase().includes(term.toLowerCase()))
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
    const observable = this.http.get<Book[]>('/api/books');

    const subscription = observable.subscribe((books) => {
      // var books: Book[] = books.val() || [];
      const filteredBooks: Book[] = books.filter(
        (book) => !!book && book.name.toLowerCase().includes(term.toLowerCase())
        // book.authorId.toLowerCase().includes(term.toLowerCase()))
        // book.synopsis?.toLowerCase().includes(term.toLowerCase())
      );

      result.next(filteredBooks.length);
      subscription.unsubscribe();
    });

    return result.asObservable();
  }

  createBook(
    name: string,
    authorId: number,
    publishDate: Date,
    pagesCount: number,
    synopsis?: string
  ): Observable<void> {
    var result = new Subject<void>();
    const observable = this.http.get<Book[]>('/api/books');

    const subscription = observable.subscribe((books) => {
      // const books: Book[] = books.val() || [];
      const nextBookId = books.length;
      subscription.unsubscribe();

      this.http
        .post<Book>('/api/books', {
          nextBookId,
          name,
          authorId,
          publishDate,
          pagesCount,
          synopsis,
        })
        .subscribe(() => {
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
    var result = new Subject<void>();
    this.http
      .put<Book>(`/api/books`, {
        bookId,
        name,
        author,
        publishDate,
        pagesCount,
        synopsis,
      })
      .subscribe(() => {
        result.next();
      });
    return result.asObservable();
  }

  deleteBook(bookId: number): Observable<void> {
    return this.http.delete<void>(`/api/books/${bookId}`);
  }
}
