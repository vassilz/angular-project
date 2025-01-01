import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ErrorMessageService } from './error-message.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.css',
})
export class ErrorMessageComponent implements OnInit, OnDestroy {
  errorMessage = signal('');

  subscription: Subscription | null = null;

  constructor(
    private errorMessageService: ErrorMessageService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.subscription = this.errorMessageService.apiError$.subscribe(
      (err: any) => {
        this.errorMessage.set(err?.message);
      }
    );
  }

  goBack() {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.subscription!.unsubscribe();
  }
}
