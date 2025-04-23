import { Observable } from 'rxjs';
import { Book } from '../types/book';

export interface BookService {
  getBooks(start: number, count: number): Observable<Book[]>;

  getBooksCount(): Observable<number>;

  getRecentBooks(count: number): Observable<Book[]>;

  //   compareDates(dateA: string, dateB: string) {
  //     return moment(dateA).isBefore(dateB) ? -1 : 1;
  //   }

  getBook(id: number): Observable<Book | null>;

  searchBooks(term: string, start: number, count: number): Observable<Book[]>;

  getSearchBooksCount(term: string): Observable<number>;

  createBook(
    name: string,
    author: string,
    publishDate: string,
    pagesCount: number,
    synopsis?: string
  ): Observable<void>;

  updateBook(
    bookId: number,
    name: string,
    author: string,
    publishDate: string,
    pagesCount: number,
    synopsis?: string
  ): Observable<void>;

  deleteBook(bookId: number): Observable<void>;
}
