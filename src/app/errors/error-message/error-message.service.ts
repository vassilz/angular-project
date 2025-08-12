import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Error } from '../error-handling.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorMessageService {
  private apiError$$ = new BehaviorSubject<Error | null>(null);
  public apiError$ = this.apiError$$.asObservable();

  constructor() {}

  setError(error: Error): void {
    this.apiError$$.next(error);
  }
}
