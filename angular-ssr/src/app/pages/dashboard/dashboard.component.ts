import {
  Component,
  computed,
  effect,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CopyOnClickDirective } from '../../directives/copy-on-click.directive';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';
import { UserService } from '../../core/services/impl/user.service';
import { MediaService } from '../../core/services/impl/media.service';
import { PurchaseService } from '../../core/services/impl/purchase.service';
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
  private purchaseService = inject(PurchaseService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  user = toSignal(this.auth.user$);
  purchases = toSignal(this.purchaseService.getAll({ status: 'completed' }), {
    initialValue: [],
  });
  returns = toSignal(this.purchaseService.getAll({ status: 'refunded' }), {
    initialValue: [],
  });

  isRefundModalOpen = signal(false);
  selectedPurchaseId = signal<number | null>(null);
  refundReason = signal('');
  refundError = signal<string | null>(null);

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
      error: () => {},
    });
  }

  private uploadImageThenSaveUser() {
    const currentUser = this.user();

    if (currentUser?.media && currentUser.media.length > 0) {
      const oldMediaId = currentUser.media[0].id;
      this.mediaService.delete(oldMediaId.toString()).subscribe({
        next: () => this.uploadNewImageThenSaveUser(),
        error: () => this.uploadNewImageThenSaveUser(),
      });
    } else {
      this.uploadNewImageThenSaveUser();
    }
  }

  private uploadNewImageThenSaveUser() {
    if (!this.selectedImageFile) return;

    this.mediaService.upload(this.selectedImageFile).subscribe({
      next: () => this.saveUserData(),
      error: () => this.saveUserData(),
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
      this.router.navigate(['/']);
    });
  }

  openRefundModal(purchaseId: number) {
    this.selectedPurchaseId.set(purchaseId);
    this.refundReason.set('');
    this.refundError.set(null);
    this.isRefundModalOpen.set(true);
  }

  closeRefundModal() {
    this.isRefundModalOpen.set(false);
    this.selectedPurchaseId.set(null);
    this.refundReason.set('');
    this.refundError.set(null);
  }

  confirmRefund() {
    const id = this.selectedPurchaseId();
    const reason = this.refundReason();

    if (!id) return;
    if (!reason || reason.trim().length < 10) {
      this.refundError.set('dashboard.reasonTooShort');
      return;
    }

    this.purchaseService.refund(id, reason).subscribe({
      next: () => {
        // Refresh data (naive approach: reload window or refetch)
        // For signals, we might need to manually trigger a refresh or just reload for now
        // Assuming the service update might trigger a signal update if wired correctly,
        // but since we used toSignal on an observable call, we need to re-run it.
        // Simple way: reload page or better, re-assign signals if they were writable (they are strictly read-only from toSignal)
        // Let's do a window reload for simplicity or just navigate to same route
        if (isPlatformBrowser(this.platformId)) {
          window.location.reload();
        }
      },
      error: () => {
        this.refundError.set('dashboard.refundError');
      },
    });
  }
}
