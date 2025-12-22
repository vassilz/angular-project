import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseAuthorService } from '../firebase-author.service';
import { Router } from '@angular/router';
import { ToastService } from '../../toast/toast.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { take } from 'rxjs';
import { NotificationsService } from '../../header/notifications/notifications.service';

@Component({
  selector: 'app-add-author',
  imports: [FormsModule],
  templateUrl: './add-author.component.html',
  styleUrl: './add-author.component.css',
})
export class AddAuthorComponent {
  constructor(
    private authorService: FirebaseAuthorService,
    private router: Router,
    private toastService: ToastService,
    private errorHandlingService: ErrorHandlingService,
    private notificationsService: NotificationsService
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
          const authorCreatedMessage = $localize`Author ${name} created successfully`;
          this.toastService.add(authorCreatedMessage);

          this.notificationsService.create(authorCreatedMessage, 'info');

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
