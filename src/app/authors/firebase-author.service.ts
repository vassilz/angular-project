import { Injectable } from '@angular/core';
import { AuthorService } from './author.service';
import { from, Observable, Subject } from 'rxjs';
import { Author } from '../types/author';
import {
  Database,
  DataSnapshot,
  get,
  query,
  ref,
  set,
} from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthorService implements AuthorService {
  constructor(private db: Database) {}
  getAuthors(): Observable<Author[]> {
    var result = new Subject<Author[]>();
    const observable = from(get(query(ref(this.db, 'authors'))));
    const subscription = observable.subscribe((data) => {
      var authors: Author[] = [];
      data.forEach((snapshot: DataSnapshot) => {
        authors.push(snapshot.val() as Author);
      });
      authors.forEach((author, index) => {
        author.id = index;
      });
      result.next(authors);
      subscription.unsubscribe();
    });

    return result.asObservable();
  }
  getAuthor(id: number): Observable<Author | null> {
    var result = new Subject<Author | null>();
    const observable = from(get(ref(this.db, `authors/${id}`)));
    observable.subscribe((data) => {
      const author: Author = data.val();
      if (!!author) {
        author.id = id;
        result.next(author);
      } else {
        result.next(null);
      }
    });
    return result.asObservable();
  }
  createAuthor(
    name: string,
    birthDate: Date,
    country: string
  ): Observable<void> {
    var result = new Subject<void>();
    const observable = from(get(ref(this.db, 'authors')));

    const subscription = observable.subscribe((data) => {
      const authors: Author[] = data.val() || [];
      const nextAuthorId = authors.length;
      subscription.unsubscribe();

      from(
        set(ref(this.db, 'authors/' + nextAuthorId), {
          name,
          birthDate,
          country,
        })
      ).subscribe(() => {
        result.next();
      });
    });

    return result.asObservable();
  }
}
