import { TestBed } from '@angular/core/testing';
import { jwtInterceptor } from './jwt.interceptor';
import { LoginService } from 'src/app/service/login.service';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { of } from 'rxjs';

describe('jwtInterceptor', () => {
  it('should pass the request through', (done) => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LoginService,
          useValue: {
            token: null,
            isLogged: () => false,
          },
        },
      ],
    });

    TestBed.runInInjectionContext(() => {
      const req = new HttpRequest('GET', '/api');
      const next: HttpHandlerFn = (r) => of(r as any);
      jwtInterceptor(req, next).subscribe(() => {
        expect(true).toBeTrue();
        done();
      });
    });
  });
});
