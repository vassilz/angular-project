import { ValidatorFn } from '@angular/forms';

export function isPastValidator(): ValidatorFn {
  return (control) => {
    const date = control.value;
    const isInPast = date && new Date(date) < new Date();

    return !isInPast ? { notInPast: true } : null;
  };
}
