import { FormBuilder } from '@angular/forms';
import { of, Subject, throwError } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { PasswordResetComponent } from './password-reset.component';

describe('PasswordResetComponent', () => {
  let component: PasswordResetComponent;
  let auth: jasmine.SpyObj<AuthService>;
  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['resetPassword']);
    component = new PasswordResetComponent(new FormBuilder(), auth);
  });
  afterEach(() => component.ngOnDestroy());
  function fill(token = ' token-admin ', confirmPassword = 'Nueva123') {
    component.form.setValue({ token, newPassword: 'Nueva123', confirmPassword });
  }
  it('requires a nonblank token and matching passwords', () => {
    fill('   '); component.submit(); expect(auth.resetPassword).not.toHaveBeenCalled();
    fill('token', 'Otra123'); component.submit(); expect(auth.resetPassword).not.toHaveBeenCalled();
  });
  it('sends only the trimmed token and new password and clears secrets on success', () => {
    auth.resetPassword.and.returnValue(of({})); fill(); component.submit();
    expect(auth.resetPassword).toHaveBeenCalledOnceWith('token-admin', 'Nueva123');
    expect(component.success).toBeTrue(); expect(component.form.controls.token.value).toBe('');
    expect(component.form.controls.newPassword.value).toBe('');
  });
  it('blocks duplicate submissions while pending', () => {
    auth.resetPassword.and.returnValue(new Subject()); fill(); component.submit(); component.submit();
    expect(auth.resetPassword).toHaveBeenCalledTimes(1); expect(component.saving).toBeTrue();
  });
  it('allows retry after an expired or invalid token', () => {
    auth.resetPassword.and.returnValue(throwError(() => ({ status: 400 }))); fill(); component.submit();
    expect(component.success).toBeFalse(); expect(component.error).toBeTruthy(); expect(component.saving).toBeFalse();
    auth.resetPassword.and.returnValue(of({})); component.submit(); expect(component.success).toBeTrue();
  });
});
