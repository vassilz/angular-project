import { Component, DestroyRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseBookService } from '../firebase-book.service';
import { Book } from '../../types/book';
import { JettyBookService } from '../jetty-book.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-book.component.html',
  styleUrl: './edit-book.component.css',
})
export class EditBookComponent {
  book: Book = {} as Book;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookService: FirebaseBookService,
    private destroyRef: DestroyRef // private bookService: JettyBookService
  ) {
    const id = this.route.snapshot.params['bookId'];

    this.bookService
      .getBook(id)
      .pipe(takeUntilDestroyed())
      .subscribe((book) => {
        this.book = book!;
      });
  }

  editBook(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const { name, author, publish_date, pages, synopsis } = form.value;

    this.bookService
      .updateBook(this.book.id, name, author, publish_date, pages, synopsis)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.router.navigate(['/books']);
      });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/books']);
  }
}
