import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FirebaseAuthorService } from '../firebase-author.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Author } from '../../types/author';
import { DatePipe, JsonPipe } from '@angular/common';
import { Book } from '../../types/book';
import { FirebaseBookService } from '../../books/firebase-book.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-author-details',
  standalone: true,
  imports: [DatePipe, RouterLink, LoaderComponent],
  templateUrl: './author-details.component.html',
  styleUrl: './author-details.component.css',
})
export class AuthorDetailsComponent implements OnInit {
  authorId: number;
  author = signal<Author | null>(null);

  isLoading = signal<boolean>(true);

  books = signal<Book[]>([]);

  constructor(
    private route: ActivatedRoute,
    private authorService: FirebaseAuthorService,
    private bookService: FirebaseBookService,
    private destroyRef: DestroyRef,
    private errorHandlingService: ErrorHandlingService
  ) {
    this.authorId = parseInt(this.route.snapshot.params['authorId']);
    this.author.set(this.route.snapshot.data['author'] as Author);

    // this.authorService
    //   .getAuthor(this.authorId)
    //   .pipe(takeUntilDestroyed())
    //   .subscribe((author) => {
    //     if (!!author) {
    //       this.author.set(author);
    //       this.isLoading.set(false);
    //     } else {
    //       this.errorHandlingService.handleError({
    //         message: `Author ${this.authorId} not found`,
    //       });
    //     }
    //   });
  }

  ngOnInit(): void {
    this.bookService
      .getBooksByAuthor(this.authorId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((books) => {
        this.books.set(books);
        this.isLoading.set(false);
      });
  }
}
