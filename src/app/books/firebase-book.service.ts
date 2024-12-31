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
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseBookService {
  constructor(private db: Database) {}

  getBooks(): Observable<DataSnapshot> {
    return from(get(ref(this.db, 'books')));
  }

  getBook(id: number): Observable<DataSnapshot> {
    return from(get(ref(this.db, `books/${id}`)));
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
