import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { Book } from '../types/book';
import { FirebaseBookService } from './firebase-book.service';
import { map } from 'rxjs';

export const bookResolver: ResolveFn<Book> = (route) => {
  const bookService = inject(FirebaseBookService);
  const router = inject(Router);
  const bookId = route.params['bookId'];
  return bookService.getBook(bookId).pipe(
    map((book) => {
      if (!book) {
        console.error(`Book with ID ${bookId} not found`);
        return new RedirectCommand(router.parseUrl('/404'), {
          skipLocationChange: true,
        });
      }
      return book;
    })
  );
};
