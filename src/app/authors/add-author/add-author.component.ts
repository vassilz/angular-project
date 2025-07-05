import { Component, DestroyRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseAuthorService } from '../firebase-author.service';
import { Router } from '@angular/router';
import { ToastService } from '../../toast/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    private destroyRef: DestroyRef
  ) {}

  addAuthor(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const { name, birth_date, country } = form.value;

    this.authorService
      .createAuthor(name, birth_date, country)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.toastService.add(`Author ${name} created successfully`);
        this.router.navigate(['/authors']);
      });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/authors']);
  }
}
