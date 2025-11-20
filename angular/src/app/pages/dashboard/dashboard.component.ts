import { Component, ElementRef, HostListener, ViewChild, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AUTH_SERVICE } from '../../core/services/auth.token';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
  
  isMenuOpen = false;
   @ViewChild('menu') menu!: ElementRef;
  ngOnInit(): void {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
   @HostListener('document:click', ['$event'])
  onClick(event: Event) {
    if (this.isMenuOpen && this.menu && !this.menu.nativeElement.contains(event.target)) {
      this.isMenuOpen = false;
    }
  }
}
