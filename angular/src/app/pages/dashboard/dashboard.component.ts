import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AUTH_SERVICE } from '../../core/services/auth.token';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CopyOnClickDirective } from '../../directives/copy-on-click.directive';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslatePipe,
    CopyOnClickDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  private auth = inject(AUTH_SERVICE);
  private authService = inject(AUTH_SERVICE);
  private router = inject(Router);

  user = computed(() => this.auth.user());

  userHandle = '@the_realCrocodile';
  userId = 'fc8cdbb6204846d2991d90b0c60d6d35';

  address = {
    line1: 'Calle Falsa 123',
    line2: 'Apto 4B',
    city: 'Madrid',
    region: 'Madrid',
    postalCode: '28001',
    country: 'España',
  };

  balance = 0;
  points = 250;

  isEditing = false;
  editableUser: any = {};

  profileImage = 'assets/icons/user.png';

  constructor() {
    effect(() => {
      const u = this.user();
      if (u) {
        this.editableUser = {
          ...u,
          username: u.username || 'usuario',
        };
        if (u.profileImage) {
          this.profileImage = u.profileImage;
        }
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.editableUser = { ...this.user() };
    }
  }

  saveChanges() {
    console.log(
      'Saving changes:',
      this.editableUser,
      this.address,
      this.profileImage,
    );
    if ('updateUser' in this.authService) {
      (this.authService as any).updateUser({
        name: this.editableUser.name,
        surname: this.editableUser.surname,
        email: this.editableUser.email,
        username: this.editableUser.username,
      });
    }

    this.isEditing = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.profileImage = result;
        if ('updateProfileImage' in this.authService) {
          (this.authService as any).updateProfileImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
