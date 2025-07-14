import { Component, DestroyRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseAuthorService } from '../firebase-author.service';
import { Router } from '@angular/router';
import { ToastService } from '../../toast/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorHandlingService } from '../../errors/error-handling.service';

@Component({
  selector: 'app-add-author',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-author.component.html',
  styleUrl: './add-author.component.css',
})
export class AddAuthorComponent {
  constructor(
    private authorService: FirebaseAuthorService,
    private router: Router,
    private toastService: ToastService,
    private destroyRef: DestroyRef,
    private errorHandlingService: ErrorHandlingService
  ) {}

  addAuthor(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const { name, birth_date, country } = form.value;

    this.authorService
      .createAuthor(name, birth_date, country)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.add(`Author ${name} created successfully`);
          this.router.navigate(['/authors']);
        },
        error: (err) => {
          this.errorHandlingService.handleError(err);
        },
      });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/authors']);
  }
}
