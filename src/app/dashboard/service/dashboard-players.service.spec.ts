import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { DashboardPlayersService } from './dashboard-players.service';
import { PlayerFormValue } from '../components/players/dashboard-player.interface';

describe('DashboardPlayersService', () => {
  let service: DashboardPlayersService;
  let http: HttpTestingController;
  const url = environment.API_URL + 'player';
  const value: PlayerFormValue = { name: 'Juan', lastName: 'Pérez', position: 'MC', valoration: 80, photo: '', isHabilitado: true, teamId: 4 };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(DashboardPlayersService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('lists all registered players rather than only market players', () => {
    service.getPlayers().subscribe(players => expect(players).toEqual([]));
    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush({ data: null, httpCode: 200 });
  });

  it('assigns the selected team using the creation contract', () => {
    service.createPlayer(value).subscribe();
    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.teamId).toBe(4);
    request.flush({ data: { id: 1 }, httpCode: 200 });
  });

  it('updates both team representations without submitting teamId to the entity update', () => {
    service.updatePlayer(1, value).subscribe();
    const request = http.expectOne(url + '/1');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body.team).toEqual({ id: 4 });
    expect(request.request.body.idTeam).toBe(4);
    expect(request.request.body.teamId).toBeUndefined();
    request.flush({ data: { affected: 1 }, httpCode: 200 });
  });

  it('treats an embedded failure in an HTTP 200 response as an error', () => {
    const error = jasmine.createSpy('error');
    service.createPlayer(value).subscribe({ next: () => fail('Must not report success'), error });
    http.expectOne(url).flush({ data: null, httpCode: 500, message: 'Failed' });
    expect(error).toHaveBeenCalled();
  });

  it('does not treat a missing player response as a successful edit', () => {
    const error = jasmine.createSpy('error');
    service.updatePlayer(999, value).subscribe({ next: () => fail('Must not report success'), error });
    http.expectOne(url + '/999').flush({ data: null, httpCode: 200 });
    expect(error).toHaveBeenCalled();
  });

  it('deletes the player record instead of an obsolete team membership route', () => {
    service.deletePlayer(1).subscribe();
    const request = http.expectOne(url + '/1');
    expect(request.request.method).toBe('DELETE');
    request.flush({ data: { id: 1 }, httpCode: 200 });
  });
});