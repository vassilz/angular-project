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
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseBookService {
  constructor(private db: Database) {}

  getBooks(): Observable<DataSnapshot> {
    return from(get(ref(this.db, 'books')));
  }

  createBook(
    bookId: string,
    name: string,
    author: string,
    publishDate: string,
    pagesCount: number
  ): Observable<void> {
    return from(
      set(ref(this.db, 'books/' + bookId), {
        name,
        author,
        publishDate,
        pagesCount,
      })
    );
  }

  updateBook(
    bookId: string,
    name: string,
    author: string,
    publishDate: string,
    pagesCount: number
  ): Observable<void> {
    return from(
      update(ref(this.db, 'books/' + bookId), {
        name,
        author,
        publishDate,
        pagesCount,
      })
    );
  }

  deleteBook(bookId: string): Observable<void> {
    return from(remove(ref(this.db, 'books/' + bookId)));
  }
}
