import { ValidatorFn } from '@angular/forms';

export function matchPasswordsValidator(
  passwordControlName: string,
  rePasswordControlName: string
): ValidatorFn {
  return (control) => {
    const passwordFormControl = control.get(passwordControlName);
    const repeatPasswordFormControl = control.get(rePasswordControlName);

    const passwordsMatch =
      passwordFormControl?.value === repeatPasswordFormControl?.value;

    return passwordsMatch ? null : { passwordsDoNotMatch: true };
  };
}
