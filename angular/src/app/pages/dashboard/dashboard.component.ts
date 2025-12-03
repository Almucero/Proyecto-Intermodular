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

  userHandle = '';
  userId = '';

  address = {
    line1: '',
    line2: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
  };

  balance = 0;
  points = 250;

  isEditing = false;
  editableUser: any = {};

  selectedImageFile: File | null = null;
  previewImageUrl: string | null = null;

  get profileImage(): string {
    if (this.previewImageUrl) {
      return this.previewImageUrl;
    }
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
        if (u.accountAt) this.userHandle = u.accountAt;
        if (u.accountId) this.userId = u.accountId;
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
    } else {
      this.clearImagePreview();
    }
  }

  private clearImagePreview() {
    if (this.previewImageUrl) {
      URL.revokeObjectURL(this.previewImageUrl);
    }
    this.previewImageUrl = null;
    this.selectedImageFile = null;
  }

  saveChanges() {
    const currentUser = this.user();
    if (currentUser && currentUser.id) {
      if (this.selectedImageFile) {
        this.uploadImageThenSaveUser();
      } else {
        this.saveUserData();
      }
    }
  }

  private saveUserData() {
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
        this.clearImagePreview();
      },
      error: (err) => console.error('Error updating user', err),
    });
  }

  private uploadImageThenSaveUser() {
    const currentUser = this.user();

    if (currentUser?.media && currentUser.media.length > 0) {
      const oldMediaId = currentUser.media[0].id;
      console.log('Deleting old profile image, ID:', oldMediaId);

      this.mediaService.delete(oldMediaId.toString()).subscribe({
        next: () => {
          console.log('Old image deleted successfully');
          this.uploadNewImageThenSaveUser();
        },
        error: (err) => {
          console.error('Error deleting old image:', err);
          this.uploadNewImageThenSaveUser();
        },
      });
    } else {
      console.log('No previous image, uploading new one');
      this.uploadNewImageThenSaveUser();
    }
  }

  private uploadNewImageThenSaveUser() {
    if (!this.selectedImageFile) return;

    this.mediaService.upload(this.selectedImageFile).subscribe({
      next: (media) => {
        console.log('Media uploaded successfully:', media);
        this.saveUserData();
      },
      error: (err) => {
        console.error('Error uploading file', err);
        this.saveUserData();
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.clearImagePreview();
      this.selectedImageFile = file;
      this.previewImageUrl = URL.createObjectURL(file);
    }
  }

  async onLogout() {
    this.auth.signOut().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
