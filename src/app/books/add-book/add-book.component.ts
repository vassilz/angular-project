import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseBookService } from '../firebase-book.service';
import { Router } from '@angular/router';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { JettyBookService } from '../jetty-book.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../toast/toast.service';
import { Author } from '../../types/author';
import { FirebaseAuthorService } from '../../authors/firebase-author.service';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.css',
})
export class AddBookComponent implements OnInit {
  isLoading = signal<boolean>(true);

  authors = signal<Author[]>([]);

  constructor(
    private bookService: FirebaseBookService,
    // private bookService: JettyBookService,
    private authorService: FirebaseAuthorService,
    private router: Router,
    private errorHandlingService: ErrorHandlingService,
    private destroyRef: DestroyRef,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAuthors();
  }

  loadAuthors() {
    this.isLoading.set(true);

    this.authorService
      .getAuthors()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((authors) => {
        this.authors.set(authors || []);
        this.isLoading.set(false);
      });
  }

  addBook(form: NgForm) {
    if (form.invalid) {
      return;
    }

    console.log('Form value:', form.value);

    const { name, author, publish_date, pages, synopsis } = form.value;

    this.bookService
      .createBook(name, author, publish_date, pages, synopsis)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.toastService.add(`Book ${name} created successfully`);
        this.router.navigate(['/books']);
      });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/books']);
  }
}
