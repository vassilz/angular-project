import { Component, OnInit, signal } from '@angular/core';
import { ErrorMessageService } from './error-message.service';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css',
})
export class ErrorMessageComponent implements OnInit {
  errorMessage = signal('');

  constructor(private errorMessageService: ErrorMessageService) {}
  ngOnInit(): void {
    this.errorMessageService.apiError$.subscribe((err: any) => {
      this.errorMessage.set(err?.message);
    });
  }
}
