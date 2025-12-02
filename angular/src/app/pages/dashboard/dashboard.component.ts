import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CopyOnClickDirective } from '../../directives/copy-on-click.directive';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { UserService } from '../../core/services/impl/user.service';
import { MediaService } from '../../core/services/impl/media.service';
import { User } from '../../core/models/user.model';

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
  private auth = inject(BaseAuthenticationService);
  private userService = inject(UserService);
  private mediaService = inject(MediaService);
  private router = inject(Router);

  user = toSignal(this.auth.user$);

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

  get profileImage(): string {
    const u = this.user();
    if (u && u.media && u.media.length > 0) {
      return u.media[0].url;
    }
    return 'assets/icons/user.png';
  }

  constructor() {
    effect(() => {
      const u = this.user();
      if (u) {
        this.editableUser = { ...u };

        // Load address from user
        if (u.addressLine1) this.address.line1 = u.addressLine1;
        if (u.addressLine2) this.address.line2 = u.addressLine2;
        if (u.city) this.address.city = u.city;
        if (u.region) this.address.region = u.region;
        if (u.postalCode) this.address.postalCode = u.postalCode;
        if (u.country) this.address.country = u.country;
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      const currentUser = this.user();
      this.editableUser = { ...currentUser };
    }
  }

  saveChanges() {
    const currentUser = this.user();
    if (currentUser && currentUser.id) {
      const updatedUser: Partial<User> = {
        name: this.editableUser.name,
        surname: this.editableUser.surname,
        email: this.editableUser.email,
        nickname: this.editableUser.nickname,
        addressLine1: this.address.line1,
        addressLine2: this.address.line2,
        city: this.address.city,
        region: this.address.region,
        postalCode: this.address.postalCode,
        country: this.address.country,
      };

      this.userService.update('me', updatedUser as User).subscribe({
        next: (user) => {
          this.auth.me().subscribe();
          this.isEditing = false;
        },
        error: (err) => console.error('Error updating user', err),
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      this.mediaService.upload(file).subscribe({
        next: (media) => {
          console.log('✅ Media uploaded successfully:', media);
          if (media && media.url) {
            // Refresh user data to get the updated media array
            this.auth.me().subscribe({
              next: (user) => {
                console.log('✅ User refreshed after upload:', user);
                console.log('📸 New profile image:', user?.media?.[0]?.url);
              },
              error: (err) => console.error('❌ Error refreshing user:', err),
            });
          }
        },
        error: (err) => console.error('❌ Error uploading file', err),
      });
    }
  }

  async onLogout() {
    this.auth.signOut().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
