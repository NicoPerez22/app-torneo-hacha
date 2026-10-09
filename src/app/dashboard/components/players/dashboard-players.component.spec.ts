import { FormBuilder } from '@angular/forms';
import { Subject, throwError } from 'rxjs';
import { DashboardPlayersComponent } from './dashboard-players.component';
import { DashboardPlayer } from './dashboard-player.interface';

describe('DashboardPlayersComponent management', () => {
  let component: DashboardPlayersComponent;
  let api: any;
  let modal: any;
  const player: DashboardPlayer = { id: 1, name: 'Juan', lastName: 'Pérez', position: 'MC', valoration: 80, photo: '', isHabilitado: 1, team: { id: 4, name: 'Equipo A' } };

  beforeEach(() => {
    api = { createPlayer: jasmine.createSpy(), updatePlayer: jasmine.createSpy(), deletePlayer: jasmine.createSpy() };
    modal = { confirm: jasmine.createSpy() };
    component = new DashboardPlayersComponent(new FormBuilder(), api, {} as any, { success: jasmine.createSpy(), error: jasmine.createSpy() } as any, modal);
    component.teams = [{ id: 4, name: 'Equipo A' }];
    component.players = [player, { ...player, id: 2, name: 'Pedro', team: null }];
  });
  afterEach(() => component.ngOnDestroy());

  it('combines name search and team filters, including unassigned players', () => {
    component.search = ' juan ';
    component.teamFilter = '4';
    expect(component.filteredPlayers.map(item => item.id)).toEqual([1]);
    component.search = '';
    component.teamFilter = 'unassigned';
    expect(component.filteredPlayers.map(item => item.id)).toEqual([2]);
  });

  it('rejects whitespace names, fractional ratings and a missing team', () => {
    component.openCreate();
    component.form.patchValue({ name: ' ', lastName: 'Pérez', position: 'MC', valoration: 80.5 });
    component.save();
    expect(component.form.invalid).toBeTrue();
    expect(api.createPlayer).not.toHaveBeenCalled();
  });

  it('loads the existing team and disabled status when editing', () => {
    component.openEdit({ ...player, isHabilitado: 0 });
    expect(component.form.controls.teamId.value).toBe(4);
    expect(component.form.controls.isHabilitado.value).toBeFalse();
    expect(component.editingId).toBe(1);
  });

  it('prevents duplicate saves while a request is pending', () => {
    const pending = new Subject();
    api.updatePlayer.and.returnValue(pending);
    component.openEdit(player);
    component.save();
    component.save();
    expect(api.updatePlayer).toHaveBeenCalledTimes(1);
    expect(component.saving).toBeTrue();
  });

  it('keeps the editor and values available after a failed save', () => {
    api.updatePlayer.and.returnValue(throwError(() => new Error('Network failure')));
    component.openEdit(player);
    component.save();
    expect(component.editorOpen).toBeTrue();
    expect(component.saving).toBeFalse();
    expect(component.saveError).not.toBe('');
    expect(component.form.controls.name.value).toBe('Juan');
  });

  it('does not delete until the confirmation is accepted', () => {
    component.confirmDelete(player);
    expect(modal.confirm).toHaveBeenCalled();
    expect(api.deletePlayer).not.toHaveBeenCalled();
  });
});