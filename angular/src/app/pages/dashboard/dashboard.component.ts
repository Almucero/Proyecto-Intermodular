import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AUTH_SERVICE } from '../../core/services/auth.token';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private auth = inject(AUTH_SERVICE);
  private router = inject(Router);

  user = computed(() => this.auth.user());

  async onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
