import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseAuthenticationService } from '../../core/services/impl/base-authentication.service';

@Component({
  selector: 'app-admin',
  imports: [RouterModule, TranslatePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  private auth = inject(BaseAuthenticationService);
  private router = inject(Router);

  ngOnInit(): void {}

  onLogout() {
    this.auth.signOut().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
