import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/service/auth.service';
import { UserService } from 'src/app/service/user.service';

interface ResetUser { id: number; name?: string; lastName?: string; email?: string; userName?: string; }
@Component({
  selector: 'app-dashboard-users',
  templateUrl: './dashboard-users.component.html',
  styleUrls: ['../players/dashboard-players.component.css'],
})
export class DashboardUsersComponent implements OnInit, OnDestroy {
  users: ResetUser[] = [];
  search = '';
  loading = false;
  error = '';
  resetUser: ResetUser | null = null;
  generating = false;
  token = '';
  resetError = '';
  copyStatus = '';
  private readonly destroyed$ = new Subject<void>();
  constructor(private readonly usersService: UserService, private readonly auth: AuthService) {}
  ngOnInit(): void { this.reload(); }
  ngOnDestroy(): void { this.destroyed$.next(); this.destroyed$.complete(); this.token = ''; }
  get filteredUsers(): ResetUser[] {
    const query = this.search.trim().toLocaleLowerCase();
    return this.users.filter(user => [user.name, user.lastName, user.email, user.userName, user.id].join(' ').toLocaleLowerCase().includes(query));
  }
  reload(): void {
    if (this.loading) return;
    this.loading = true; this.error = '';
    this.usersService.getUsers().pipe(takeUntil(this.destroyed$), finalize(() => this.loading = false)).subscribe({
      next: response => {
        if (response?.code === -1 || response?.httpCode >= 400 || !Array.isArray(response?.data)) { this.error = 'No se pudieron cargar los usuarios.'; return; }
        this.users = response.data;
      },
      error: () => this.error = 'No se pudieron cargar los usuarios.',
    });
  }
  openReset(user: ResetUser): void { this.resetUser = user; this.token = ''; this.resetError = ''; this.copyStatus = ''; }
  closeReset(): void { if (this.generating) return; this.resetUser = null; this.token = ''; this.resetError = ''; this.copyStatus = ''; }
  generate(): void {
    if (!this.resetUser || this.generating || this.token) return;
    this.generating = true; this.resetError = '';
    this.auth.generatePasswordReset(this.resetUser.id).pipe(takeUntil(this.destroyed$), finalize(() => this.generating = false)).subscribe({
      next: token => this.token = token,
      error: () => this.resetError = 'No se pudo generar el token. Revisá tus permisos e intentá nuevamente.',
    });
  }
  async copyToken(): Promise<void> {
    const token = this.token;
    if (!token) return;
    try { await navigator.clipboard.writeText(token); if (this.token === token) this.copyStatus = 'Token copiado.'; }
    catch { if (this.token === token) this.copyStatus = 'No se pudo copiar automáticamente. Seleccioná el token y copialo manualmente.'; }
  }
}
