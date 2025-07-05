import { Observable } from 'rxjs';
import { Author } from '../types/author';

export interface AuthorService {
  getAuthors(): Observable<Author[]>;

  getAuthor(id: number): Observable<Author | null>;

  createAuthor(
    name: string,
    birthDate: Date,
    country: string
  ): Observable<void>;
}
