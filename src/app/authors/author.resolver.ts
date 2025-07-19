import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { Author } from '../types/author';
import { FirebaseAuthorService } from './firebase-author.service';

export const authorResolver: ResolveFn<Author> = (route) => {
  const authorService = inject(FirebaseAuthorService);
  const router = inject(Router);
  const authorId = route.params['authorId'];
  return authorService.getAuthor(authorId).pipe(
    map((author) => {
      if (!author) {
        console.error(`Author with ID ${authorId} not found`);
        return new RedirectCommand(router.parseUrl('/404'), {
          skipLocationChange: true,
        });
      }
      return author;
    })
  );
};
