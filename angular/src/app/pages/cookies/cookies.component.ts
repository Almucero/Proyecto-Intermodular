import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-cookies',
  imports: [RouterModule, HeaderComponent, TranslatePipe],
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.scss',
})
export class CookiesComponent {
  ngOnInit(): void {}
}
