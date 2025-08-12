import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FirebaseBookService } from '../firebase-book.service';
import { Router } from '@angular/router';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { JettyBookService } from '../jetty-book.service';
import { ToastService } from '../../toast/toast.service';
import { Author } from '../../types/author';
import { FirebaseAuthorService } from '../../authors/firebase-author.service';
import { isPastValidator } from './is-past.validator';
import { take } from 'rxjs';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.css',
})
export class AddBookComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    author: new FormControl(0, { nonNullable: true }),
    publish_date: new FormControl(new Date(), {
      validators: [isPastValidator()],
      nonNullable: true,
    }),
    pages: new FormControl(0, { nonNullable: true }),
    synopsis: new FormControl('', { nonNullable: true }),
  });

  isLoading = signal<boolean>(true);

  authors = signal<Author[]>([]);

  constructor(
    private bookService: FirebaseBookService,
    // private bookService: JettyBookService,
    private authorService: FirebaseAuthorService,
    private router: Router,
    private errorHandlingService: ErrorHandlingService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAuthors();
  }

  loadAuthors() {
    this.isLoading.set(true);

    this.authorService
      .getAuthors()
      .pipe(take(1))
      .subscribe((authors) => {
        this.authors.set(authors || []);
        this.isLoading.set(false);
      });
  }

  addBook() {
    if (this.form.invalid) {
      return;
    }

    console.log('Form value:', this.form.value);

    const { name, pages, publish_date, synopsis } = this.form.value;
    const author = +this.form.value.author!; // need the value as a number

    this.bookService
      .createBook(name!, author!, publish_date!, pages!, synopsis)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.add($localize`Book ${name} created successfully`);
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
