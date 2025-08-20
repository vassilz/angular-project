import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseAuthorService } from '../firebase-author.service';
import { Router } from '@angular/router';
import { ToastService } from '../../toast/toast.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { take } from 'rxjs';

@Component({
    selector: 'app-add-author',
    imports: [FormsModule],
    templateUrl: './add-author.component.html',
    styleUrl: './add-author.component.css'
})
export class AddAuthorComponent {
  constructor(
    private authorService: FirebaseAuthorService,
    private router: Router,
    private toastService: ToastService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  addAuthor(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const { name, birth_date, country } = form.value;

    this.authorService
      .createAuthor(name, birth_date, country)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.add($localize`Author ${name} created successfully`);
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
