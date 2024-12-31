import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RerenderService {
  constructor() {}

  public rerenderReviews: EventEmitter<void> = new EventEmitter<void>();

  public rerenderBooks: EventEmitter<void> = new EventEmitter<void>();
}
