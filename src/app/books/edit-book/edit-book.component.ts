import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseBookService } from '../firebase-book.service';
import { Book } from '../../types/book';
import { JettyBookService } from '../jetty-book.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FirebaseAuthorService } from '../../authors/firebase-author.service';
import { Author } from '../../types/author';
import { ToastService } from '../../toast/toast.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-book.component.html',
  styleUrl: './edit-book.component.css',
})
export class EditBookComponent {
  book = signal<Book>({} as Book);
  author = signal<Author | null>(null);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookService: FirebaseBookService,
    private authorService: FirebaseAuthorService,
    private destroyRef: DestroyRef,
    private toastService: ToastService,
    private errorHandlingService: ErrorHandlingService // private bookService: JettyBookService
  ) {
    const id = this.route.snapshot.params['bookId'];
    this.book.set(this.route.snapshot.data['book'] as Book);

    this.loadAuthor();

    // this.bookService
    //   .getBook(id)
    //   .pipe(takeUntilDestroyed())
    //   .subscribe((book) => {
    //     this.book = book!;
    //     this.loadAuthor();
    //   });
  }

  loadAuthor() {
    this.authorService
      .getAuthor(this.book().authorId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((author) => {
        this.author.set(author || null);
      });
  }

  editBook(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const { name, publish_date, pages, synopsis } = form.value;

    this.bookService
      .updateBook(
        this.book().id,
        name,
        this.author()!.id,
        publish_date,
        pages,
        synopsis
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.add(`Book ${this.book.name} updated successfully`);
          this.router.navigate(['/books']);
        },
        error: (err) => {
          this.errorHandlingService.handleError(err);
        },
      });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/books']);
  }
}
