import { of, Subject, throwError } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { UserService } from 'src/app/service/user.service';
import { DashboardUsersComponent } from './dashboard-users.component';

describe('DashboardUsersComponent', () => {
  let component: DashboardUsersComponent;
  let auth: jasmine.SpyObj<AuthService>;
  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['generatePasswordReset']);
    const users = jasmine.createSpyObj('UserService', ['getUsers']);
    component = new DashboardUsersComponent(users as UserService, auth);
  });
  afterEach(() => component.ngOnDestroy());
  it('waits for explicit generation and sends the selected account ID', () => {
    component.openReset({ id: 7, email: 'user@example.com' });
    expect(auth.generatePasswordReset).not.toHaveBeenCalled();
    auth.generatePasswordReset.and.returnValue(of('reset-token'));
    component.generate();
    expect(auth.generatePasswordReset).toHaveBeenCalledOnceWith(7);
    expect(component.token).toBe('reset-token');
    component.closeReset(); expect(component.token).toBe('');
  });
  it('prevents duplicate token generation while pending and after success', () => {
    const response = new Subject<string>();
    auth.generatePasswordReset.and.returnValue(response);
    component.openReset({ id: 7 }); component.generate(); component.generate();
    expect(auth.generatePasswordReset).toHaveBeenCalledTimes(1);
    response.next('token'); response.complete(); component.generate();
    expect(auth.generatePasswordReset).toHaveBeenCalledTimes(1);
  });
  it('clears the previous account token and handles permission failures', () => {
    component.openReset({ id: 7 }); component.token = 'previous';
    component.openReset({ id: 8 }); expect(component.token).toBe('');
    auth.generatePasswordReset.and.returnValue(throwError(() => ({status: 403})));
    component.generate(); expect(component.resetError).toBeTruthy();
    expect(component.generating).toBeFalse(); expect(component.token).toBe('');
  });
});
