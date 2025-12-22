import { Component, effect, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseBookService } from '../firebase-book.service';
import { Book } from '../../types/book';
import { JettyBookService } from '../jetty-book.service';
import { FirebaseAuthorService } from '../../authors/firebase-author.service';
import { Author } from '../../types/author';
import { ToastService } from '../../toast/toast.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { take } from 'rxjs';
import { FirebaseStorageService } from '../../firebase-storage.service';
import { NotificationsService } from '../../header/notifications/notifications.service';

@Component({
  selector: 'app-edit-book',
  imports: [FormsModule],
  templateUrl: './edit-book.component.html',
  styleUrl: './edit-book.component.css',
})
export class EditBookComponent {
  book = signal<Book>({} as Book);
  author = signal<Author | null>(null);

  imageUrl = signal<string>('');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookService: FirebaseBookService,
    private authorService: FirebaseAuthorService,
    private toastService: ToastService,
    private errorHandlingService: ErrorHandlingService,
    private storageService: FirebaseStorageService, // private bookService: JettyBookService,
    private notificationsService: NotificationsService
  ) {
    const id = this.route.snapshot.params['bookId'];
    this.book.set(this.route.snapshot.data['book'] as Book);
    this.imageUrl.set(this.book().imageUrl || '');

    this.loadAuthor();

    effect(() => {
      this.book().imageUrl = this.imageUrl();
    });
  }

  loadAuthor() {
    this.authorService
      .getAuthor(this.book().authorId)
      .pipe(take(1))
      .subscribe((author) => {
        this.author.set(author || null);
      });
  }

  editBook(form: NgForm) {
    if (form.invalid) {
      return;
    }

    console.log(form.value);

    const { name, publish_date, pages, synopsis } = form.value;

    this.bookService
      .updateBook(
        this.book().id,
        name,
        this.author()!.id,
        publish_date,
        pages,
        synopsis,
        this.imageUrl()
      )
      .pipe(take(1))
      .subscribe({
        next: () => {
          const bookUpdatedMessage = $localize`Book ${
            this.book().name
          } updated successfully`;
          this.toastService.add(bookUpdatedMessage);

          this.notificationsService.create(
            bookUpdatedMessage,
            'info',
            'update-book',
            this.book().id
          );

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

  uploadImage(form: NgForm, event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      const file = files[0];
      this.storageService
        .uploadFile(file)
        .then((url) => {
          console.log('Image uploaded successfully:', url);

          this.imageUrl.set(url);

          form.form.patchValue({ image: url });
        })
        .catch((error) => {
          console.error('Error uploading image:', error);
        });
    }
  }

  removeImage() {
    this.imageUrl.set('');
  }
}
